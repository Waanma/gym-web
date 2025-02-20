// app/dashboard/layout.tsx
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-6 bg-gray-50">
        <DashboardHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
