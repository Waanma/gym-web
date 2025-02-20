'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useUserStore } from '@/store/userStore';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import InfiniteLoader from './InfiniteLoader';

export default function DashboardHeader() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // ✅ Aseguramos que currentUser esté en el store
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn('⚠️ No user is currently authenticated.');
          setLoading(false);
          return;
        }

        // 🔥 Obtener datos del usuario desde Firestore
        const docRef = doc(db, 'gyms', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() || {};

          // ✅ Almacenar usuario en Zustand Store
          setCurrentUser({
            id: user.uid,
            name: data?.user_data?.name || user.email || 'Guest',
            email: user.email || 'No email',
            phone_number: data?.phone_number || 'No phone number',
            address: data?.address || 'No address',
            role: data?.role || 'client',
            gym_id: data?.gym || '',
          });
        } else {
          console.warn('⚠️ Gym document not found for user:', user.uid);
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [setCurrentUser]);

  const userName = loading ? <InfiniteLoader /> : currentUser?.name || 'Guest';
  const userEmail = currentUser?.email || 'No Email';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-lg font-bold">Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg"
        >
          <div className="items-start">
            <div className="text-sm font-semibold italic">{userName}</div>
            {userEmail && (
              <div className="text-xs text-gray-400">{userEmail}</div>
            )}
          </div>
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-10">
            <ul>
              <li>
                <button
                  onClick={() => router.push('/profile')}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/config')}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                >
                  Config
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full text-left"
                >
                  LogOut
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
