"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Page() {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to add an entry.");
      setIsLoading(false);
      return;
    }
    const { error } = await supabase
      .from("entries")
      .insert([{ title, category, description, user_id: user.id }]);
    if (error) {
      setError(error.message);
    } else {
      setTitle("");
      setCategory("");
      setDescription("");
      console.log("Successfully added entry");
      router.push("/user/dashboard");
    }
    setIsLoading(false);
  }

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
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="entry-title">Title:</Label>
                  <Input
                    id="entry-title"
                    type="text"
                    placeholder="Your entry title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category:</Label>
                  <select
                    id="category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select category</option>
                    <option
                      value="Front-end Web Development"
                      className="text-xl"
                    >
                      Front-end Web Development
                    </option>
                    <option
                      value="Back-end Web Development"
                      className="text-xl"
                    >
                      Back-end Web Development
                    </option>
                    <option
                      value="Full-Stack Web Development"
                      className="text-xl"
                    >
                      Full-Stack Web Development
                    </option>
                    <option value="Mobile Development" className="text-xl">
                      Mobile Development
                    </option>
                    <option value="UI/UX" className="text-xl">
                      UI/UX
                    </option>
                    <option value="Technical Writing" className="text-xl">
                      Technical Writing
                    </option>
                    <option value="Product Design" className="text-xl">
                      Product Design
                    </option>
                    <option value="Product Management" className="text-xl">
                      Product Management
                    </option>
                    <option
                      value="Data Science / Machine Learning"
                      className="text-xl"
                    >
                      Data Science / Machine Learning
                    </option>
                    <option value="Artificial Intelligence" className="text-xl">
                      Artificial Intelligence
                    </option>
                    <option value="Cloud Computing / DevOps" className="text-xl">
                      Cloud Computing/DevOps
                    </option>
                    <option
                      value="Networking / Network Security"
                      className="text-xl"
                    >
                      Networking/Network Security
                    </option>
                    <option value="Game Development" className="text-xl">
                      Game Development
                    </option>
                    <option value="Embedded Systems / IoT" className="text-xl">
                      Embedded Systems/IoT
                    </option>
                    <option
                      value="Database Administration (SQL/NoSQL)"
                      className="text-xl"
                    >
                      Database Administration (SQL/NoSQL)
                    </option>
                    <option value="AR/VR Development" className="text-xl">
                      AR/VR Development
                    </option>
                    <option
                      value="Blockchain / Web3 Development"
                      className="text-xl"
                    >
                      Blockchain / Web3 Development
                    </option>
                    <option value="Cybersecurity" className="text-xl">
                      Cybersecurity
                    </option>
                  </select>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
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
