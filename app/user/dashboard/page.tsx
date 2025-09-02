import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { entries as EntryCards } from "@/components/entry-cards";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Divider } from "@mantine/core";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1 w-full pt-[30px]">
      <div className="flex flex-col gap-4 items-start">
        <h2 className="text-2xl font-bold">My Entries</h2>
        <Divider my="md" />

        <Button asChild>
          <Link href="/user/new-entry">Add new entry</Link>
        </Button>

        {/* Entries list */}
        <div className="w-full">
          {!entries || entries.length === 0 ? (
            <span>You haven&apos;t made any entries!</span>
          ) : (
            <div
              className="
                grid grid-cols-1 gap-4 
                sm:grid-cols-2 
                lg:grid-cols-3
              "
            >
              <EntryCards entries={entries} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
