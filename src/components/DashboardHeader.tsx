import Link from 'next/link';

export default function DashboardHeader({ gymName }: { gymName: string }) {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-lg font-bold">{gymName} Dashboard</h1>
      <Link href="/" className="text-red-400 hover:underline">
        Logout
      </Link>
    </header>
  );
}
