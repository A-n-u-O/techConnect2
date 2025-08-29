/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@/lib/supabase/server"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Profile } from "@/components/interfaces";

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

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

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

  // Page renders immediately with all data loaded!
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="w-24"></div>
      </div>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Profile Details</CardTitle>
          <Link href="/user/settings/edit-profile">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {profile ? "Edit Profile" : "Create Profile"}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                {profile.profile_picture ? (
                  <Image
                    src={profile.profile_picture}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-2 border-gray-300 mb-4 w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                <h2 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-600">{profile.email}</p>

                {joinedDate && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {joinedDate}
                  </div>
                )}
              </div>

              {profile.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About Me</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <User size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No profile information found</p>
              <Link href="/user/settings/edit-profile">
                <Button>Create Your Profile</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
