/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Profile } from "@/components/interfaces";
import FollowerCount from "@/components/followers-count";
import FollowerSparkline from "@/components/follower-sparkline";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !authUser) {
    redirect("/login");
  }

  const joinedDate = authUser.created_at
    ? new Date(authUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", authUser.id);

  const profile: Profile | null = profileData
    ? {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        bio: profileData.bio,
        email: profileData.email || authUser.email || "",
        profile_picture: profileData.avatar_url || "",
      }
    : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="w-24"></div>
      </div>

      <Card className="w-full">
  <CardHeader>
    <div className="flex flex-col items-center text-center space-y-4">
      {profile?.profile_picture ? (
        <Image
          src={profile.profile_picture}
          alt="Profile"
          width={120}
          height={120}
          className="rounded-full object-cover border-2 border-gray-300 w-32 h-32"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={64} className="text-gray-400" />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold">
          {profile?.first_name} {profile?.last_name}
        </h2>
        <p className="text-gray-600">{profile?.email}</p>
        {joinedDate && (
          <div className="flex justify-center items-center text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            Joined {joinedDate}
          </div>
        )}
      </div>
    </div>
  </CardHeader>

  <CardContent>
    {/* Stats */}
    <div className="flex justify-center gap-8 my-6 text-center">
      <div>
        <p className="text-lg font-semibold">
          <FollowerCount viewedUserId={authUser.id} />
        </p>
        <p className="text-sm text-gray-500">Followers</p>
      </div>
      <div>
        <p className="text-lg font-semibold">{followingCount ?? 0}</p>
        <p className="text-sm text-gray-500">Following</p>
      </div>
    </div>

    {/* Sparkline */}
    <div className="flex justify-center my-4">
      <div className="w-full max-w-sm">
        <FollowerSparkline userId={authUser.id} />
      </div>
    </div>

    {/* About */}
    {profile?.bio && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">About Me</h3>
        <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
      </div>
    )}

    {/* Chat/Interactions */}
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <p className="text-sm text-gray-500 mb-2">
        Start a conversation with your followers.
      </p>
      {/* Your chat component goes here */}
      <div className="rounded-md border p-4 bg-gray-50">
        {/* Example placeholder */}
        <p className="text-gray-400 text-sm text-center">Chat coming soon...</p>
      </div>
    </div>
  </CardContent>
</Card>

    </div>
  );
}
