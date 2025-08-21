"use client";

import { Profile } from "@/components/interfaces";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Camera, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    loadUserAndProfile();
  }, []);

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
      setEmail(authUser.email || "");

      // Load profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.log("No existing profile found, this is okay for new users");
      } else if (data) {
        const profileData: Profile = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          bio: data.bio,
          email: data.email || authUser.email || "",
          profile_picture: data.avatar_url || data.profile_picture,
        };
        setProfile(profileData);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
        setProfilePictureUrl(data.avatar_url || data.profile_picture || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user) {
        router.push("/profile?error=no_user");
        return;
      }

      let avatarUrl = profilePictureUrl;

      // Upload new profile picture if selected
      if (profilePicture) {
        try {
          const fileExt = profilePicture.name.split(".").pop();
          const fileName = `${user.id}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, profilePicture);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            // Continue without the image rather than failing completely
          } else {
            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            avatarUrl = urlData.publicUrl;
          }
        } catch (uploadError) {
          console.error("Error in image upload:", uploadError);
        }
      }

      // Update profile in database using upsert
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        email: user.email,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving profile:", error);
        console.error("Error details:", error.details);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        router.push("/user/profile?error=save_failed");
      } else {
        console.log("Profile saved successfully");
        router.push("/user/profile?success=true");
      }
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      router.push("/user/profile?error=unexpected_error");
    } finally {
      setSaving(false);
    }
  }

  async function handleProfilePictureChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setProfilePicture(file);

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfilePictureUrl(previewUrl);
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
      <Card className="w-full">
        <CardHeader>
          <Button
            onClick={() => router.back()}
            className="flex items-center text-sm text-blue-600 hover:underline mb-4 w-32">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl">
            {profile ? "Edit Profile" : "Create Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {profilePictureUrl ? (
                  <Image
                    src={profilePictureUrl}
                    alt="Profile preview"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                <Label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer">
                  <Camera className="h-5 w-5" />
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Click the camera icon to upload a profile picture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed opacity-75"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed as it's used for authentication
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
              <Link href="/profile">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
