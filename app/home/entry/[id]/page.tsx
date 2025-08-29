/* eslint-disable @next/next/no-img-element */
// app/home/entry/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MessageCircleMore, Heart } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    // 1. Fetch the main entry with author profile
    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .select(
        `
        id,
        title,
        description,
        created_at,
        updated_at,
        category,
        user_id,
        profiles (
          id,
          first_name,
          last_name,
          email,
          bio,
          avatar_url
        )
      `
      )
      .eq("id", resolvedParams.id)
      .single();

    if (entryError || !entry) {
      console.error("Entry error:", entryError);
      return notFound();
    }

    // 2. Fetch comments for this entry
    const { data: comments } = await supabase
      .from("comments")
      .select(
        `
        id,
        comment_text,
        created_at,
        profiles (
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("entry_id", resolvedParams.id)
      .order("created_at", { ascending: false });

    // 3. Fetch likes count and check if current user liked
    const { data: likes } = await supabase
      .from("likes")
      .select("id, user_id")
      .eq("entry_id", resolvedParams.id);

    // 4. Get current user (for checking if they liked the post)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userHasLiked = user
      ? likes?.some((like) => like.user_id === user.id)
      : false;
    const likesCount = likes?.length || 0;

    // 5. Fetch other entries by the same author (related posts)
    const { data: relatedEntries } = await supabase
      .from("entries")
      .select("id, title, created_at")
      .eq("user_id", entry.user_id)
      .neq("id", resolvedParams.id)
      .order("created_at", { ascending: false })
      .limit(3);

    const authorName =
      `${entry.profiles?.first_name || ""} ${
        entry.profiles?.last_name || ""
      }`.trim() || "Unknown User";

    const authorFirstName = `${entry.profiles?.first_name}`;

    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Author section */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <img
                src={entry.profiles?.avatar_url || "/default-avatar.png"}
                alt={authorName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <Link href={`/profile/${entry.profiles?.id}`}>
                  <h3 className="font-bold text-lg">{authorName}</h3>
                </Link>
                <p className="text-gray-600 text-sm">{entry.profiles?.bio}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>
                    Published: {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  {entry.updated_at !== entry.created_at && (
                    <span>
                      Updated: {new Date(entry.updated_at).toLocaleDateString()}
                    </span>
                  )}
                  {entry.category && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {entry.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Entry Content */}
            <article className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {entry.title}
              </h1>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {entry.description}
                </p>
              </div>
              <div className="flex gap-5 mt-2">
                <span>
                  <Heart />
                </span>
                <span>
                  <MessageCircleMore />
                </span>
              </div>
            </article>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">
                Comments ({comments?.length || 0})
              </h2>

              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: Comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={
                          comment.profiles?.avatar_url || "/default-avatar.png"
                        }
                        alt={`${comment.profiles?.first_name} ${comment.profiles?.last_name}`}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {`${comment.profiles?.first_name || ""} ${
                              comment.profiles?.last_name || ""
                            }`.trim() || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.comment_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Posts */}
            {relatedEntries && relatedEntries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-lg mb-4">
                  More from {authorFirstName}
                </h3>
                <div className="space-y-3">
                  {relatedEntries.map((relatedEntry) => (
                    <a
                      key={relatedEntry.id}
                      href={`/home/entry/${relatedEntry.id}`}
                      className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {relatedEntry.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(relatedEntry.created_at).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h3 className="font-bold text-lg mb-4">Entry Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes:</span>
                  <span className="font-medium">{likesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments:</span>
                  <span className="font-medium">{comments?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-medium">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Page error:", error);
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-red-100 p-4 rounded">
          <h1 className="text-xl font-bold text-red-800">
            Error Loading Entry
          </h1>
          <p className="text-red-600">
            Something went wrong. Check the console for details.
          </p>
        </div>
      </div>
    );
  }
}
