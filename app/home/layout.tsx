import ProfileNav from "@/components/profiie-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ProfileNav />
        <div className="flex-1 flex flex-col gap-20 items-center p-5">
          {children}
      </div>
    </div>
  );
}
