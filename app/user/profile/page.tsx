"use client";

import { Profile } from "@/components/interfaces";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success/error messages from edit page
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      // Clear the message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

      // Clear the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }

    if (error) {
      let errorMessage = "Failed to update profile. Please try again.";
      if (error === "no_user") errorMessage = "No user found. Please log in again.";
      if (error === "save_failed") errorMessage = "Failed to save profile. Please try again.";
      if (error === "unexpected_error") errorMessage = "An unexpected error occurred.";
      
      setMessage({
        type: "error",
        text: errorMessage,
      });
      setTimeout(() => setMessage(null), 5000);
      
      // Clear the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }

    loadUserAndProfile();
  }, [searchParams]);

  async function loadUserAndProfile() {
    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        console.error("No authenticated user", userError);
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Format joined date
      if (authUser.created_at) {
        setJoinedDate(
          new Date(authUser.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
      }

      // Load profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        // It's okay if no profile exists yet
      } else if (data) {
        const profileData: Profile = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          bio: data.bio,
          email: data.email || authUser.email || "",
          profile_picture: data.avatar_url || "", // Use avatar_url consistently
        };

        setProfile(profileData);
      }
    } catch (err) {
      console.error("Unexpected error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* navigation header  */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="w-24"></div> {/* Spacer for balanced layout */}
      </div>
      
      {/* Success/Error Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
          {message.text}
        </div>
      )}

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
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Profile Yet</h3>
              <p className="text-gray-600 mb-4">
                {user?.email && `Logged in as: ${user.email}`}
              </p>
              {joinedDate && (
                <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {joinedDate}
                </p>
              )}
              <Link href="/user/settings/edit-profile">
                <Button>Create Profile</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}