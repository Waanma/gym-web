'use client';

import { useAuthListener } from '@/hooks/useAuthListener';
import { ReactNode } from 'react';

export default function AuthProvider({ children }: { children: ReactNode }) {
  useAuthListener();
  
  return <>{children}</>;
}
