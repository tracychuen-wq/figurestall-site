// 綁好正式網域後，在 Cloudflare 環境變數設定 CANONICAL_HOST（例如 www.example.com.tw），
// 舊網址（專案名稱.pages.dev、不含 www 的主網域）就會 301 轉到正式網址。
// 沒設定時不做任何轉址；預覽部署（xxxx.專案名稱.pages.dev）一律不轉，方便測試。
export const onRequest = async ({ request, env, next }) => {
  const canonical = (env.CANONICAL_HOST || '').trim().toLowerCase();
  if (!canonical) return next();
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const apex = canonical.replace(/^www\./, '');
  const isProdPagesDev = /^[^.]+\.pages\.dev$/.test(host);
  if (host !== canonical && (host === apex || host === 'www.' + apex || isProdPagesDev)) {
    url.hostname = canonical; url.protocol = 'https:'; url.port = '';
    return Response.redirect(url.toString(), 301);
  }
  return next();
};
