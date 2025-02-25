// useAuthListener.tsx
'use client';

import { auth } from '@/config/firebaseConfig';
import { useUserStore } from '@/store/userStore';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export function useAuthListener() {
  const { setCurrentUser, fetchCurrentUser, currentUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Si currentUser ya tiene datos (creados en registerUser), no sobrescribirlos.
        if (!currentUser) {
          // Llamamos a fetchCurrentUser para obtener los datos completos desde la API
          fetchCurrentUser();
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [setCurrentUser, fetchCurrentUser, currentUser]);
}
