// Decap CMS 的 GitHub 登入（第 2 步）：用 code 換 token，交回給後台視窗
const page = (status, content) => `<!doctype html><html><body><p>${status === 'success' ? '登入成功，視窗將自動關閉…' : '登入失敗，請關閉視窗再試一次。'}</p><script>
(function () {
  function receive(e) {
    window.opener.postMessage('authorization:github:${status}:' + ${JSON.stringify(JSON.stringify(content))}, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener && window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const saved = (cookie.match(/decap_oauth_state=([^;]+)/) || [])[1];
  const html = (s, c) => new Response(page(s, c), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'decap_oauth_state=; Path=/api; Max-Age=0' } });

  if (!code || !state || state !== saved) return html('error', { message: '驗證失敗（state 不符）' });

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'decap-oauth' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/api/callback` }),
  });
  const data = await res.json();
  if (!data.access_token) return html('error', { message: data.error_description || '無法取得授權' });
  return html('success', { token: data.access_token, provider: 'github' });
}
