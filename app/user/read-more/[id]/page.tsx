/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Entry } from "@/components/interfaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReadMorePage() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();
  const { id } = useParams();

  useEffect(() => {
    async function fetchEntry() {
      if (!id) {
        setError("Entry does not exist");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("entries")
          .select("*")
          .eq("id", id)
          .single();
        if (!error) setEntry(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occured");
      } finally {
        setLoading(false);
      }
    }

    fetchEntry();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className=" flex min-h-screen items-center justify-center">
        <div className=" text-center">
          <p>Loading entry</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className=" text-center">
          <p className=" text-red-500 mb-4">
            {error || "Entry not found"}
            <Link
              href="/user/dashboard"
              className=" inline-flex items-center mb-6 text-sm text-blue-600 hover:underline">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to all entries
              </Button>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  //formatting date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/user/dashboard"
        className="inline-flex items-center mb-6 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all entries
      </Link>

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl mb-2">{entry.title}</CardTitle>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
                {entry.category}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created: {formatDate(entry.created_at)}
            </div>
            {entry.updated_at !== entry.created_at && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Updated: {formatDate(entry.updated_at)}
              </div>
            )}
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              Author ID: {entry.user_id}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {entry.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
