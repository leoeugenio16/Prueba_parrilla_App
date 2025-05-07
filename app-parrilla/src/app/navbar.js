"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [bgImage, setBgImage] = useState("/imagenMobile.jpg");
  const router = useRouter(); // useRouter hook para redirigir
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar si el usuario está logueado
  const pathname = usePathname();

  const handleToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newBgImage = window.innerWidth >= 1024 ? "/imagenPC.jpg" : "/imagenMobile.jpg";
      setBgImage(newBgImage);

      // Comprobar si el token existe en el localStorage al montar el componente
      const token = localStorage.getItem('jwt');
      if (token) {
        setIsLoggedIn(true); // El usuario está logueado
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt'); // Eliminar el token del localStorage
    setIsLoggedIn(false); // Actualizar el estado
    router.push('/login'); // Redirigir al usuario a la página de login
  };

  if (pathname === "/menu/") return null;
  return (
    <nav
      className="bg-cover bg-center bg-no-repeat py-4 shadow-md sticky top-0 z-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-lg font-bold text-white hover:text-gray-100">
          <img
            src="/logoParrilla.png"
            alt="Logo"
            className="h-8 w-auto ml-4 md:ml-0"
          />
        </Link>

        {/* Menú visible en pantallas grandes, oculto en pantallas pequeñas */}
        <ul className="md:flex md:items-center space-x-4 hidden">
          <li>
            <Link
              href="/agregar-producto"
              className="text-white hover:text-gray-100 font-bold"
            >
              Agregar Producto
            </Link>
          </li>
          <li>
            <Link
              href="/editar-producto"
              className="text-white hover:text-gray-100 font-bold"
            >
              Editar Producto
            </Link>
          </li>
          <li>
            <Link
              href="/tablero"
              className="text-white hover:text-gray-100 font-bold"
            >
              Tablero
            </Link>
          </li>
          <li>
            <Link
              href="/ciere-de-caja"
              className="text-white hover:text-gray-100 font-bold"
            >
              Cierre de Caja
            </Link>
          </li>
          {/* Botón Cerrar sesión solo si está logueado */}
          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>

        {/* Botón hamburguesa solo en pantallas pequeñas */}
        <button
          className="md:hidden flex justify-center items-center w-10 h-10 bg-brown-500 hover:bg-brown-700 rounded-full"
          onClick={handleToggleMenu}
        >
          <svg
            className="w-6 h-6 text-white" // Ajustamos el tamaño del icono
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Menú desplegable debajo de la hamburguesa en pantallas pequeñas */}
      {showMenu && (
        <div
          className="md:hidden flex flex-col items-start bg-brown-500 shadow-md mt-2 py-4 px-6 rounded"
          onClick={() => setShowMenu(false)}
        >
          <Link
            href="/agregar-producto"
            className="text-white hover:text-gray-100 font-bold py-2"
            onClick={() => setShowMenu(false)}
          >
            Agregar Producto
          </Link>
          <Link
            href="/editar-producto"
            className="text-white hover:text-gray-100 font-bold py-2"
            onClick={() => setShowMenu(false)}
          >
            Editar Producto
          </Link>
          <Link
            href="/tablero"
            className="text-white hover:text-gray-100 font-bold py-2"
            onClick={() => setShowMenu(false)}
          >
            Tablero
          </Link>
          <Link
            href="/ciere-de-caja"
            className="text-white hover:text-gray-100 font-bold"
          >
            Cierre de Caja
          </Link>
          {/* Mostrar el botón Cerrar sesión en el menú móvil */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mt-2"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
