/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from "@/components/interfaces";
import { createClient } from "@/lib/supabase/server"; // <-- use server version
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  searchParams?: { success?: string; error?: string };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let joinedDate = "";

  if (authUser) {
    if (authUser.created_at) {
      joinedDate = new Date(authUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Load profile data
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      profile = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        email: data.email || authUser.email || "",
        profile_picture: data.avatar_url || data.profile_picture,
      };
    }
  }

  const message = searchParams?.success
    ? { type: "success", text: "Profile updated successfully!" }
    : searchParams?.error
    ? { type: "error", text: "Failed to update profile. Please try again." }
    : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* navigation header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <div className="w-24"></div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {profile && (
              <>
                <h2 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className=" text-sm text-gray-600">{profile.email}</p>
              </>
            )}
          </CardTitle>
          <Link href="/user/settings/edit-profile">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {profile ? "Edit Profile" : "Create Profile"}
            </Button>
          </Link>
        </CardHeader>
      </Card>
    </div>
  );
}
