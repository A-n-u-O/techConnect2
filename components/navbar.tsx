import Link from "next/link";
import { Button } from "../components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <h1 className="text-lg">TechConnect</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant={"outline"}>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant={"default"}>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
