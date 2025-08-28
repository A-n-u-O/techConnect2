/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Profile } from "@/components/interfaces";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Camera, ArrowLeft, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { cn } from "@/lib/utils";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

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
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>(""); // For blob URL cleanup


  // Crop state
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    loadUserAndProfile();
    
    // Cleanup blob URLs on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
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
          profile_picture: data.avatar_url || "", // Use avatar_url consistently
        };

        setProfile(profileData);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
        setCurrentProfilePictureUrl(data.avatar_url || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
      setShowCropModal(true);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  async function getCroppedImg(): Promise<Blob | null> {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  }

  async function handleCropComplete() {
    const croppedImageBlob = await getCroppedImg();
    if (croppedImageBlob) {
      const file = new File([croppedImageBlob], "profile-picture.jpg", {
        type: "image/jpeg",
      });

      setProfilePicture(file);

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new preview URL and store it for cleanup
      const newPreviewUrl = URL.createObjectURL(croppedImageBlob);
      setPreviewUrl(newPreviewUrl);
      setCurrentProfilePictureUrl(newPreviewUrl);

      setShowCropModal(false);
    }
  }

  function removeProfilePicture() {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    
    setCurrentProfilePictureUrl("");
    setProfilePicture(null);
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user) {
        router.push("/user/profile?error=no_user");
        return;
      }

      let avatarUrl = profile?.profile_picture || ""; // Keep existing URL as fallback

      // Upload new profile picture if selected
      if (profilePicture) {
        console.log("Uploading new profile picture...");
        const fileExt = "jpg";
        // Use folder structure expected by RLS: userId/filename
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, profilePicture, { 
            upsert: true,
            contentType: 'image/jpeg'
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with form submission even if image upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          
          avatarUrl = urlData.publicUrl;
          console.log("Image uploaded successfully:", avatarUrl);
          
          // Clean up the preview URL since we now have the permanent URL
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
          }
        }
      }

      // Update profile in database using upsert
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        email: user.email,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        console.error("Error saving profile:", upsertError);
        router.push("/user/profile?error=save_failed");
        return;
      }

      console.log("Profile saved successfully");
      router.push("/user/profile?success=true");

    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      router.push("/user/profile?error=unexpected_error");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfilePicture(imageFile: File): Promise<string | null> {
    try {
      if (!user?.id) {
        console.error("No user ID available");
        return null;
      }

      const fileExt = imageFile.name.split(".").pop() || "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      console.log("Uploading file:", fileName, "to bucket: avatars");

      // Check if bucket exists first
      const { data: buckets, error: bucketError } =
        await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets);

      if (bucketError) {
        console.error("Error checking buckets:", bucketError);
      }

      const avatarBucket = buckets?.find((bucket) => bucket.name === "avatars");
      if (!avatarBucket) {
        console.error(
          "Avatars bucket not found! Please create it in the Supabase dashboard."
        );
        return null;
      }

      // Delete old profile picture if it exists
      if (
        profile?.profile_picture &&
        profile.profile_picture.includes("supabase")
      ) {
        try {
          const oldFileName = profile.profile_picture.split("/").pop();
          if (oldFileName && oldFileName !== fileName) {
            console.log("Deleting old file:", oldFileName);
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([oldFileName]);

            if (deleteError) {
              console.log("Could not delete old profile picture:", deleteError);
            }
          }
        } catch (deleteError) {
          console.log("Error during old file deletion:", deleteError);
        }
      }

      // Upload new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: imageFile.type,
        });

      console.log("Upload result:", { uploadData, uploadError });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      console.log("Public URL:", urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadProfilePicture:", error);
      return null;
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
      <Card className="w-full">
        <CardHeader>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center w-32"
          >
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
                {currentProfilePictureUrl ? (
                  <div className="relative">
                    <Image
                      src={currentProfilePictureUrl}
                      alt="Profile preview"
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-2 border-gray-300 w-32 h-32"
                      unoptimized={currentProfilePictureUrl.startsWith('blob:')}
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                <Label
                  htmlFor="profile-picture"
                  className={cn(
                    "absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100",
                    currentProfilePictureUrl && "bottom-2 right-2"
                  )}
                >
                  <Camera className="h-5 w-5" />
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="hidden"
                  />
                </Label>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Click the camera icon to upload a profile picture
              </p>
              
            </div>

            {/* Crop Modal */}
            {showCropModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Crop your profile picture
                  </h3>

                  {imgSrc && (
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop>
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        style={{ maxHeight: "60vh", maxWidth: "100%" }}
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  )}
                  <div className="flex gap-3 mt-4">
                    <Button 
                      type="button"
                      onClick={handleCropComplete} 
                      className="flex-1"
                    >
                      {cropping ? "Processing..." : "Apply Crop"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCropModal(false)}
                      className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                Email cannot be changed as it&apos;s used for authentication
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
