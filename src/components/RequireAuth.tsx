// src/components/RequireAuth.tsx
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      // Rediriger vers la page de connexion
      router.push('/connexion');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null; // Ou un composant de chargement pendant la vérification
  }

  return children;
};

export default RequireAuth;
