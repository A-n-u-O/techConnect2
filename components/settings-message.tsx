"use client";

import { useSearchParams } from "next/navigation";

export default function SettingsMessage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  if (!success && !error) return null;

  const type = success ? "success" : "error";
  const text = success
    ? "Profile updated successfully!"
    : "Failed to update profile. Please try again.";

  return (
    <div
      className={`mb-6 p-4 rounded-md ${
        type === "success"
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      {text}
    </div>
  );
}
