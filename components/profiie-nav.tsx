"use client";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { useState } from "react";
import { FloatingIndicator, UnstyledButton } from "@mantine/core";
import classes from "@/components/Demo.module.css";
import { usePathname } from "next/navigation";
import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import BurgerMenu from './burger';

const navigationData = [
  { label: "Home", href: "/home", value: "/home" },
  { label: "Search", href: "/search", value: "/search" },
  { label: "Profile", href: "/user/dashboard/", value: "/user/dashboard" },
];

export default function ProfileNav() {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});

  // Find the active index based on current pathname
  const activeIndex = navigationData.findIndex(
    (item) => item.value === pathname
  );

  const setControlRef = (value: string) => (node: HTMLButtonElement) => {
    controlsRefs[value] = node;
    setControlsRefs(controlsRefs);
  };

  const controls = navigationData.map((item) => (
    <UnstyledButton
      key={item.value}
      className={classes.control}
      ref={setControlRef(item.value)}
      data-active={pathname === item.value || undefined}
    >
      <Link href={item.href} className={classes.controlLabel}>
        {item.label}
      </Link>
    </UnstyledButton>
  ));

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="block md:hidden">
          <BurgerMenu/>
        </div>
        <div className="flex items-center font-semibold">
          <Link href={"/"} className="text-base">
            TechConnect
          </Link>
        </div>

        <div className="hidden md:block">
          <div className={classes.root} ref={setRootRef}>
            {controls}
            <FloatingIndicator
              target={
                activeIndex >= 0
                  ? controlsRefs[navigationData[activeIndex].value]
                  : null
              }
              parent={rootRef}
              className={classes.indicator}
            />
          </div>
        </div>

        <LogoutButton />
      </div>
    </nav>
  );
}
