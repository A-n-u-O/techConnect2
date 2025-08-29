/* eslint-disable @typescript-eslint/no-unused-vars */
// app/profile/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User, Calendar, Users, FileText } from "lucide-react";
import Image from "next/image";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.id;

  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();


  // Fetch user profile with avatar
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, bio, avatar_url, created_at")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <Link href="/search">
            <Button variant="outline" className="mb-4">
              ← Go back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            User not found
          </h1>
          <p className="text-gray-600">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Check if following (only if logged in)
  let isFollowing = false;
  let followerCount = 0;
  let followingCount = 0;

  if (currentUser) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)
      .single();

    isFollowing = !!followData;
  }

  // Get follower/following counts
  const { count: followers } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  const { count: following } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  followerCount = followers || 0;
  followingCount = following || 0;

  // Fetch user's entries/posts
  const { data: entries, error: entriesError } = await supabase
    .from("entries") // Assuming your posts table is called "posts"
    .select("id, title, description, created_at, category")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Format joined date
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Follow action
  async function follow() {
    "use server";
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
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

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/search">
            <Button variant="outline">← Back to Search</Button>
          </Link>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    width={150}
                    height={150}
                    className="rounded-full object-cover border-4 border-white shadow-lg w-32 h-32 md:w-40 md:h-40"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <User size={64} className="text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.first_name} {profile.last_name}
                </h1>

                {profile.bio && (
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 mb-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users size={16} />
                      <span className="font-semibold">{followerCount}</span>
                      <span className="text-sm">Followers</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users size={16} />
                      <span className="font-semibold">{followingCount}</span>
                      <span className="text-sm">Following</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500">
                      <FileText size={16} />
                      <span className="font-semibold">
                        {entries?.length || 0}
                      </span>
                      <span className="text-sm">Posts</span>
                    </div>
                  </div>
                </div>

                {joinedDate && (
                  <div className="flex justify-center md:justify-start items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {joinedDate}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center md:justify-start gap-3">
                  {currentUser && !isOwnProfile && (
                    <form action={isFollowing ? unfollow : follow}>
                      <Button
                        type="submit"
                        variant={isFollowing ? "outline" : "default"}
                        className={
                          isFollowing
                            ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            : ""
                        }
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    </form>
                  )}

                  {!currentUser && (
                    <Link href="/login">
                      <Button>Sign in to Follow</Button>
                    </Link>
                  )}

                  {isOwnProfile && (
                    <Link href="/user/settings/edit-profile">
                      <Button variant="outline">Edit Profile</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Posts/Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries && entries.length > 0 ? (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                        {entry.title}
                      </h3>
                      {entry.category && (
                        <Badge variant="secondary">{entry.category}</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {entry.description}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {isOwnProfile
                    ? "You haven't"
                    : `${profile.first_name} hasn't`}{" "}
                  posted anything yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
