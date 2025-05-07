import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json(); // Obtener los datos del formulario de login
    
    console.log("Datos recibidos:", { identifier, password });

    // Realizar la solicitud al endpoint de Strapi para obtener el token de autenticación
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier, // nombre de usuario o email
        password,   // contraseña del usuario
      }),
    });

    const data = await res.json();

    // Verificar si la respuesta es exitosa
    if (res.ok && data.jwt) {
      console.log("Autenticación exitosa:", data.jwt);

      // Aquí puedes almacenar el JWT en cookies o en localStorage (preferible cookies para mayor seguridad)
      return NextResponse.json({
        message: 'Autenticación exitosa',
        token: data.jwt, // El token JWT de Strapi
      }, { status: 200 });
    }

    // Si la autenticación falla
    return NextResponse.json({ message: 'Usuario o contraseña incorrectos' }, { status: 401 });

  } catch (error) {
    console.error('Error en la autenticación:', error);
    return NextResponse.json({ message: 'Error en la autenticación' }, { status: 500 });
  }
}
