'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [nombre, setNombre] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const newBgImage = window.innerWidth >= 1024 ? '/imagenPC.jpg' : '/imagenMobile.jpg';
    setBgImage(newBgImage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: nombre, password: contrasenia }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirigir a la página de dashboard después del login exitoso
        const { jwt } = data;
        localStorage.setItem('jwt', jwt);
        localStorage.setItem('usuario', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setLoginError(true); // Se activa la bandera de error
        setError(data.message || 'Error al iniciar sesión.'); // Muestra el error del backend o un mensaje genérico
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setLoginError(true); // Se activa la bandera de error
      setError('Hubo un problema al intentar autenticarte. Intenta de nuevo.'); // Error general
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex justify-center items-center flex-grow">
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#333333] p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-[#effef2] text-center">Iniciar Sesión</h1>

          <div>
            <label htmlFor="nombre" className="block text-xl font-medium mb-1 text-[#effef2] font-bold">
              Correo Electrónico
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setLoginError(false); // Restablecer loginError a false
              }}
              required
              className={`w-full p-3 border ${loginError ? 'border-red-500' : 'border-[#444444]'} rounded-lg bg-[#333333] text-[#34C759] font-bold`}
            />
            {loginError && <p className="text-red-500 text-sm mt-1">Correo o contraseña incorrectos.</p>}
          </div>

          <div>
            <label htmlFor="contrasenia" className="block text-xl font-medium mb-1 text-[#effef2] font-bold">
              Contraseña
            </label>
            <input
              type="password"
              id="contrasenia"
              value={contrasenia}
              onChange={(e) => {
                setContrasenia(e.target.value);
                setLoginError(false); // Restablecer loginError a false
              }}
              required
              className={`w-full p-3 border ${loginError ? 'border-red-500' : 'border-[#444444]'} rounded-lg bg-[#333333] text-[#34C759] font-bold`}
            />
            {loginError && <p className="text-red-500 text-sm mt-1">Correo o contraseña incorrectos.</p>}
          </div>

          {loginError && <p className="text-red-500 text-center mt-4">{error}</p>}

          <button
            type="submit"
            className="bg-[#34C759] hover:bg-[#2ecc71] text-white font-bold py-3 px-6 rounded-lg w-full"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
