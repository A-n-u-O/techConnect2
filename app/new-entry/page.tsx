"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function Page() {
  const error = "";
  const isLoading = "";
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <Link href="/protected" className="flex mb-5 text-sm items-center">
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
            <CardTitle className="text-2xl">Create a new entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="entry-title">Title:</Label>
                  <Input
                    id="entry-title"
                    type="text"
                    placeholder="Your entry title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="entry">Description:</Label>
                  </div>
                  <Input
                    id="entry"
                    type="text"
                    placeholder="Your entry"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500"></p>}
                <Button type="submit" className="w-full">
                  {isLoading ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Entry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
