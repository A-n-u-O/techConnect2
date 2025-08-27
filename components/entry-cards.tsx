"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Entry } from "./interfaces";
import Link from "next/link";
import { Button } from "./ui/button";
interface EntryCardsProps {
  entries: Entry[];
}

export function entries({ entries }: EntryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="w-full">
          <CardHeader>
            <CardTitle>{entry.title}</CardTitle>
            <CardDescription>{entry.category}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{entry.description}</p>
          </CardContent>
          <CardFooter>
            <Link href={`/user/read-more/${entry.id}`}>
              <Button>Read More</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
