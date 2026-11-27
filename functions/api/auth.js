// Decap CMS 的 GitHub 登入（第 1 步）：導向 GitHub 授權頁
// 需要在 Cloudflare Pages 設定環境變數 GITHUB_CLIENT_ID、GITHUB_CLIENT_SECRET
export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) return new Response('尚未設定 GITHUB_CLIENT_ID', { status: 500 });
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const auth = new URL('https://github.com/login/oauth/authorize');
  auth.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  auth.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  auth.searchParams.set('scope', 'repo,user');
  auth.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      'Set-Cookie': `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
