"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FollowersChart({ userId }: { userId: string }) {
  const supabase = createClient();
  const [chartData, setChartData] = useState<
    { day: string; followers: number }[]
  >([]);

  useEffect(() => {
    async function fetchFollowers() {
      const { data, error } = await supabase
        .from("follows")
        .select("created_at")
        .eq("following_id", userId);

      if (error) {
        console.error("Error fetching followers:", error);
        return;
      }

      const countsByDay: Record<string, number> = {};

      data.forEach((row) => {
        const day = new Date(row.created_at).toISOString().split("T")[0]; // YYYY-MM-DD
        countsByDay[day] = (countsByDay[day] || 0) + 1;
      });

      const formatted = Object.entries(countsByDay).map(([day, count]) => ({
        day,
        followers: count,
      }));

      setChartData(formatted);
    }

    fetchFollowers();
  }, [userId]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
