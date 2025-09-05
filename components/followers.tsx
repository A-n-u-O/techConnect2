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
import { Loader } from "@mantine/core";

export default function FollowersChart({ userId }: { userId: string }) {
  const supabase = createClient();
  const [chartData, setChartData] = useState<
    { day: string; followers: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("follows")
        .select("created_at")
        .eq("following_id", userId);

      if (error) {
        console.error("Error fetching followers:", error);
        setLoading(false);
        return;
      }

      const countsByDay: Record<string, number> = {};
      data.forEach((row) => {
        const day = new Date(row.created_at).toISOString().split("T")[0];
        countsByDay[day] = (countsByDay[day] || 0) + 1;
      });

      const sortedDays = Object.keys(countsByDay).sort();
      let runningTotal = 0;
      const formatted = sortedDays.map((day) => {
        runningTotal += countsByDay[day];
        return { day, followers: runningTotal };
      });

      setChartData(formatted);
      setLoading(false);
    }

    fetchFollowers();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader color="blue" size="lg" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No followers data found.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }} // small dots on data points
            activeDot={{ r: 6 }} // highlight active dot on hover
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
