"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function FollowerSparkline({ userId }: { userId: string }) {
  const supabase = createClient();
  const [chartData, setChartData] = useState<
    { day: string; followers: number }[]
  >([]);

  const formatData = (data: { created_at: string }[]) => {
    const countsByDay: Record<string, number> = {};
    data.forEach((row) => {
      const day = new Date(row.created_at).toISOString().split("T")[0];
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    });

    const sortedDays = Object.keys(countsByDay).sort();
    let runningTotal = 0;
    return sortedDays.map((day) => {
      runningTotal += countsByDay[day];
      return { day, followers: runningTotal };
    });
  };

  useEffect(() => {
    async function fetchFollowers() {
      const { data } = await supabase
        .from("follows")
        .select("created_at")
        .eq("following_id", userId);

      if (data) {
        setChartData(formatData(data));
      }
    }

    fetchFollowers();

    // realtime updates
    const channel = supabase
      .channel("sparkline-followers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabase
            .from("follows")
            .select("created_at")
            .eq("following_id", userId);

          if (data) {
            setChartData(formatData(data));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="w-full h-16"> {/* small height for sparkline */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Tooltip
            formatter={(value: number) => [`${value} followers`, ""]}
            labelFormatter={(day) => `Date: ${day}`}
          />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
