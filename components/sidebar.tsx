import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarClient from "./SidebarClient";

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

  return <SidebarClient firstName={profileData?.first_name ?? "Developer"} />;
}
