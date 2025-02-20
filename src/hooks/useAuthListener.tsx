'use client';

import { auth } from '@/config/firebaseConfig';
import { useUserStore } from '@/store/userStore';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export function useAuthListener() {
  const resetUser = useUserStore((state) => state.setCurrentUser);
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCurrentUser();
      } else {
        resetUser(null);
      }
    });
    return () => unsubscribe();
  }, [fetchCurrentUser, resetUser]);
}
