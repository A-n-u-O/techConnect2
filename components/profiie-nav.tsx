"use client";

import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { useState } from "react";
import { FloatingIndicator, Tabs } from "@mantine/core";
import classes from "./Demo.module.css";
import { usePathname } from "next/navigation";
import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";

export default function ProfileNav() {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };


  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex items-center font-semibold">
          <Link href={"/"} className="text-md">
            TechConnect
          </Link>
        </div>
        <div>
          <Tabs variant="none" value={pathname} onChange={() => {}}>
            <Tabs.List ref={setRootRef} className={classes.list}>
              <Tabs.Tab
                value="/home"
                ref={setControlRef("/home")}
                className={classes.tab}
              >
                <Link href="/home">Home</Link>
              </Tabs.Tab>
              <Tabs.Tab
                value="/search"
                ref={setControlRef("/search")}
                className={classes.tab}
              >
                <Link href="/search">Search</Link>
              </Tabs.Tab>
              <Tabs.Tab
                value="/user"
                ref={setControlRef("/user")}
                className={classes.tab}
              >
                <Link href="/user/dashboard">Profile</Link>
              </Tabs.Tab>

              <FloatingIndicator
                target={pathname ? controlsRefs[pathname] : null}
                parent={rootRef}
                className={
                  "!top-0 !bottom-0 flex items-center " + classes.indicator
                }
              />
            </Tabs.List>
          </Tabs>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
