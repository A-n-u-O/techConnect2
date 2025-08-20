import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="text-3xl font-bold">My Entries</h2>
        <br />
        <Button>
          <Link href="/new-entry">Add new entry</Link>
        </Button>
        <br />
        {1 < 2 ? ( //Change it to less than to see the card of entries
          <span>You haven&apos;t made any entries!</span>
        ) : (
          <div>
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>
                  Details about your latest project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  This project is 75% complete. You can track progress and make
                  updates below.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Read More</Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
