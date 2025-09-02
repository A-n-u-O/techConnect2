import Sidebar from "@/components/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar handles both desktop + mobile */}
      <Sidebar />

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto pt-[64px] md:pt-0 p-4">
        {children}
      </main>
    </div>
  );
}
