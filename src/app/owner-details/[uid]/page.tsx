'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Loader from '@/components/Loader';
import { OwnerDetails } from '@/types/ownerDetails';

export default function OwnerDetailsPage() {
  const { uid } = useParams(); // Obtener el uid de la URL
  const router = useRouter();

  const [formData, setFormData] = useState<OwnerDetails>({
    full_name: '',
    phone_number: '',
    address: '',
    subscription_plan: 'Basic',
    subscription_start_date: '', // Inicializamos con una cadena vacía
    preferred_payment_method: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (uid) {
      // Obtener los detalles del gimnasio y dueño desde Firestore
      const fetchOwnerDetails = async () => {
        try {
          const docRef = doc(db, 'gyms', String(uid));
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              full_name: data.user_data?.name || '',
              phone_number: data.user_data?.phone_number || '',
              address: data.user_data?.address || '',
              subscription_plan: data.subscription_plan || 'Basic',
              subscription_start_date:
                formatDate(data.subscription_start_date) || '', // Formateamos la fecha
              preferred_payment_method: data.preferred_payment_method || '',
            });
          } else {
            setError('No gym data found.');
          }
        } catch (err) {
          setError('Error fetching data.');
          console.error(err);
        }
      };
      fetchOwnerDetails();
    }
  }, [uid]);

  const formatDate = (date: string) => {
    // Si la fecha no está vacía, la formateamos como yyyy-MM-dd
    if (date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      return formattedDate;
    }
    return '';
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setDoc(
        doc(db, 'gyms', String(uid)),
        {
          user_data: {
            address: formData.address,
            name: formData.full_name,
            phone_number: formData.phone_number,
          },
          subscription_plan: formData.subscription_plan,
          subscription_start_date: formData.subscription_start_date,
          preferred_payment_method: formData.preferred_payment_method,
        },
        { merge: true }
      );

      router.push(`/dashboard/${uid}`);
    } catch (err) {
      setError('Error saving data.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold mb-4">Enter Additional Information</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          value={formData.full_name}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          onChange={handleChange}
          value={formData.phone_number}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="address"
          placeholder="Gym Address"
          onChange={handleChange}
          value={formData.address}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <p>Optional:</p>
        <select
          name="subscription_plan"
          value={formData.subscription_plan}
          onChange={handleChange}
          className="border p-2 rounded bg-gray-800 text-white"
        >
          <option value="Basic">Basic Plan</option>
          <option value="Advanced">Advanced Plan</option>
          <option value="Premium">Premium Plan</option>
        </select>

        {/* Campo de fecha formateado correctamente */}
        <input
          type="date"
          name="subscription_start_date"
          value={formData.subscription_start_date}
          onChange={handleChange}
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="text"
          name="preferred_payment_method"
          placeholder="Preferred Payment Method"
          onChange={handleChange}
          value={formData.preferred_payment_method}
          className="border p-2 rounded bg-gray-800 text-white"
        />

        {loading ? (
          <Loader />
        ) : (
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Save and Continue
          </button>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
