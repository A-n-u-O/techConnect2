"use client"
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ProfileNav from "@/components/profiie-nav";

export default function Page() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setError(`Error fetching user: ${userError.message}`);
        setResults([]);
        setLoading(false);
        return;
      }

      const loggedInUserId = user?.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("first_name", `%${query}%`);

      if (error) {
        console.error("Supabase error:", error);
        setError(`Search error: ${error.message}`);
        setResults([]);
      } else {
        const filteredResults = (data ?? []).filter(
          (user) => user.id !== loggedInUserId
        );
        setResults(filteredResults);
        console.log(`Found ${filteredResults.length} results`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProfileNav />
      <div className="p-6">
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="border p-2 rounded w-full"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div>
          {loading ? (
            <p className="text-gray-500">Searching...</p>
          ) : results.length > 0 ? (
            <div>
              <p className="mb-2 text-sm text-gray-600">
                Found {results.length} result(s):
              </p>
              {results.map((user) => (
                <div
                  key={user.id}
                  className="border-b py-2 hover:cursor-pointer"
                >
                  <Link href={`/profile/${user.id}`}>
                    <p className="font-bold">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.bio}</p>
                    <p className="text-xs text-gray-400">ID: {user.id}</p>
                  </Link>
                </div>
              ))}
            </div>
          ) : query.trim() && !loading ? (
            <p className="text-gray-500">
              No results found for &quot;{query}&quot;
            </p>
          ) : (
            <p className="text-gray-500">Enter a search term to get started</p>
          )}
        </div>
      </div>
    </>
  );
}
