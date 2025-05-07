import cookie from 'cookie';

export function getToken(req: Request) {
  const cookies = cookie.parse(req.headers.get('Cookie') || '');
  return cookies.auth_token; // Acceder al token JWT almacenado en la cookie
}