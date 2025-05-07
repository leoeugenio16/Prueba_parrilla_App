'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    // Asegurarse de que el código solo se ejecute en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt');
      if (!token) {
        // Redirigir inmediatamente si no hay token
        router.push('/login');
      }
    }
  }, [router]);

  // Si no hay token, la redirección se maneja y no se renderiza el contenido
  return <>{children}</>;
};

export default AuthProvider;
