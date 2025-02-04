import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="#" className="hover:underline">
              🏋️ Users
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:underline">
              ⚙️ Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
