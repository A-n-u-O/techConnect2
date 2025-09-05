import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FollowersChart from "@/components/followers";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Protect route
  const { data: claims, error } = await supabase.auth.getClaims();
  if (error || !claims?.claims) {
    redirect("/auth/login");
  }

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Followers Growth</h1>
      <FollowersChart userId={user.id} />
    </div>
  );
}
