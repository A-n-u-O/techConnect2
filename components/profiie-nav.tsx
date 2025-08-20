"use client";

import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { useState } from "react";
import { FloatingIndicator, Tabs } from "@mantine/core";
import classes from "./Demo.module.css";
import { usePathname } from "next/navigation";
import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import { Button } from "@mantine/core";
import {
  Spotlight,
  SpotlightActionData,
  SpotlightActionGroupData,
  spotlight,
} from "@mantine/spotlight";
import { Search } from "lucide-react";

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

  const actions: (SpotlightActionGroupData | SpotlightActionData)[] = [];

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex items-center font-semibold">
          <Link href={"/"} className="text-md">
            TechConnect {pathname == "/protected" && " | User Dashboard"}
          </Link>
        </div>
        {pathname == "/protected" ? (
          ""
        ) : (
          <Button onClick={spotlight.open} className="flex justify-center">
            {" "}
            <Search size={15} />
            Search
          </Button>
        )}
        <Spotlight
          actions={actions}
          nothingFound="Nothing found..."
          highlightQuery
          searchProps={{
            leftSection: <Search size={20} />,
            placeholder: "Search...",
          }}
        />
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
                value="/notifications"
                ref={setControlRef("/notifications")}
                className={classes.tab}
              >
                <Link href="notifications">Notifications</Link>
              </Tabs.Tab>
              <Tabs.Tab
                value="/protected"
                ref={setControlRef("/protected")}
                className={classes.tab}
              >
                <Link href="/protected">Profiles</Link>
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
