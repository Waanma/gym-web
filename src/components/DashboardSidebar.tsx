// DashboardSidebar.tsx
import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="/dashboard/users" className="hover:underline">
              🏋️ Users
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/dashboard/trainers" className="hover:underline">
              👨‍🏫 Trainers
            </Link>
          </li>
          <li>
            <Link href="/dashboard/settings" className="hover:underline">
              ⚙️ Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
