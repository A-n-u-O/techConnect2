import ProfileNav from "@/components/profiie-nav";
import Sidebar from "@/components/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <ProfileNav />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col gap-20 items-center p-5">
          {children}
        </div>
      </div>
    </main>
  );
}
