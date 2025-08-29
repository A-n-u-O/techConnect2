"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function FollowerCount({
  viewedUserId,
}: {
  viewedUserId: string;
}) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    async function loadInitial() {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", viewedUserId);

      setCount(count || 0);
    }

    loadInitial();

    const channel = supabase
      .channel("follows-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${viewedUserId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCount((c) => c + 1);
          } else if (payload.eventType === "DELETE") {
            setCount((c) => Math.max(0, c - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewedUserId]);

  return <p>{count}</p>;
}
