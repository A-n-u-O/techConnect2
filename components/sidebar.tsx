import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarClient from "./SidebarClient";
import SidebarMobile from "./SidebarMobile";

export default async function Sidebar() {
  const supabase = await createClient();

  // Protect route
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user?.id)
    .single();

  const firstName = profileData?.first_name ?? "Developer";

  return (
    <>
      {/* Mobile Navbar */}
      <div className="block md:hidden fixed top-1 left-0 w-full z-50">
        <SidebarMobile firstName={firstName} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarClient firstName={firstName} />
      </div>
    </>
  );
}
