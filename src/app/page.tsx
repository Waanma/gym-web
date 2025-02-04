'use client';

import { useState } from 'react';
import RegisterPage from '@/app/register/page';
import LoginPage from '@/app/login/page';

export default function HomePage() {
  const [isRegister, setIsRegister] = useState(true);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-900 text-white flex flex-col justify-center items-center p-8">
        <h1 className="text-4xl font-bold">Gym Rutinas</h1>
        <p className="text-lg mt-4 text-center">
          Organiza, gestiona y lleva el control de las rutinas de tus clientes
          de manera eficiente.
        </p>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center p-8">
        <div className="bg-black p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4 text-center">
            {isRegister ? 'Register' : 'Login'}
          </h2>

          <div>
            {isRegister ? (
              <RegisterPage toggle={() => setIsRegister(false)} />
            ) : (
              <LoginPage toggle={() => setIsRegister(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
