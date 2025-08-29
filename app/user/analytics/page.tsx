import FollowersChart from "@/components/followers";
import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
    
  return (
    <div className="w-[1000px] p-6">
      <h1 className="text-xl font-bold mb-4">Followers Growth</h1>
      {userId ? (
        <FollowersChart userId={userId} />
      ) : (
        <div>User not found.</div>
      )}
    </div>
  );
}
