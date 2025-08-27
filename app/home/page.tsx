import { createClient } from "@/lib/supabase/server";
import { Card, Text, Badge, Button, Group } from "@mantine/core";
import Link from "next/link";


export default async function Page() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });


  return (
      <main>
        {posts?.map((post) => (
          <Card shadow="sm" padding="lg" radius="md" withBorder key={post.id}>
            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>{post.title}</Text>
              <Badge color="blue">{post.category}</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              {post.description}
            </Text>

            <Link href={`/home/entry/${post.id}`}>
              <Button color="black" fullWidth mt="md" radius="md">
                Read More
              </Button>
            </Link>
          </Card>
        ))}
      </main>
  );
}
