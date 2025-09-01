import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarClientDesktop from "./SidebarClient";
import MobileSidebarComponent from "./SidebarMobile";

export default async function Sidebar() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user?.id)
    .single();

  return (
    <div>
      <div className="block md:hidden">{/* <MobileSidebarComponent /> */}</div>

      <div className="hidden md:block">
        <SidebarClientDesktop
          firstName={profileData?.first_name ?? "Developer"}
        />
      </div>
    </div>
  );
}
