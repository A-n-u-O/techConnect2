import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Handle both Next.js 14 and 15 params format
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.id;

  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Fetch the profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, bio")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError);
    return (
      <div className="p-6">
        <Link href="/search">
          <Button>Go back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-red-600">User not found</h1>
        <p className="text-gray-600">
          The profile you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  // Check if current user is already following this profile
  let isFollowing = false;
  if (currentUser) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)
      .single();

    isFollowing = !!followData;
  }

  // Follow action
  async function follow() {
    "use server";
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login"); // Redirect to login if not authenticated
    }

    // Check if already following to prevent duplicates
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single();

    if (!existingFollow) {
      const { error } = await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: userId,
      });

      if (error) {
        console.error("Follow error:", error);
        // You could add error handling here
      }
    }

    revalidatePath(`/profile/${userId}`);
  }

  // Unfollow action
  async function unfollow() {
    "use server";
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", userId);

    if (error) {
      console.error("Unfollow error:", error);
    }

    revalidatePath(`/profile/${userId}`);
  }

  // Don't show follow button if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/search">
          <Button variant="outline">← Go back</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-2">
          {profile.first_name} {profile.last_name}
        </h1>

        {profile.bio && (
          <p className="text-gray-600 mb-4 text-lg">{profile.bio}</p>
        )}

        {/* Follow/Unfollow Button */}
        {currentUser && !isOwnProfile && (
          <div className="mt-4">
            {isFollowing ? (
              <form action={unfollow}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Following ✓
                </Button>
              </form>
            ) : (
              <form action={follow}>
                <Button type="submit" className="w-full sm:w-auto">
                  Follow
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!currentUser && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>{" "}
              to follow this user
            </p>
          </div>
        )}

        {/* Own profile indicator */}
        {isOwnProfile && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">This is your profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
