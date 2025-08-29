"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const supabase = createClient();

interface FollowButtonProps {
  currentUserId: string;
  viewedUserId: string;
}

export default function FollowButton({
  currentUserId,
  viewedUserId,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkFollowing() {
      setLoading(true);
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("following_id", viewedUserId)
        .maybeSingle();

      if (!error) {
        setIsFollowing(!!data);
      }
      setLoading(false);
    }

    if (currentUserId && viewedUserId) {
      checkFollowing();
    }
  }, [currentUserId, viewedUserId]);

  async function handleFollowToggle() {
    if (loading || isFollowing === null) return;

    setLoading(true);
    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", viewedUserId);

      if (!error) {
        setIsFollowing(false);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert([{ follower_id: currentUserId, following_id: viewedUserId }]);

      if (!error) {
        setIsFollowing(true);
      }
    }
    setLoading(false);
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={loading || isFollowing === null}
      className={`text-white ${isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
    >
      {isFollowing === null
        ? "Loading..."
        : isFollowing
        ? "Unfollow"
        : "Follow"}
    </Button>
  );
}
