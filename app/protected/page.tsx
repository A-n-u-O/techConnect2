import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import  {entries as EntryCards} from "@/components/entry-cards";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });
  

  return (
    <div className="flex-1 w-full">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="text-3xl font-bold">My Entries</h2>
        <br />
        <Button>
          <Link href="/new-entry">Add new entry</Link>
        </Button>
        <br />
        {(!entries || entries.length === 0) ? (
          <span>You haven&apos;t made any entries!</span>
        ) : (
          <EntryCards entries={entries} />
        )}
      </div>
    </div>
  );
}
