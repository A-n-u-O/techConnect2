import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Entry } from "./interfaces";
interface EntryCardsProps {
  entries: Entry[];
}

export function entries({ entries }: EntryCardsProps) {
  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="w-[350px]">
          <CardHeader>
            <CardTitle>{entry.title}</CardTitle>
            <CardDescription>{entry.category}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{entry.description}</p>
          </CardContent>
          <CardFooter>
            <Button>Read More</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
