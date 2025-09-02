"use client";

import { useDisclosure } from "@mantine/hooks";
import { Burger, Drawer } from "@mantine/core";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Settings,
  BarChart3,
  HelpCircle,
} from "lucide-react";

export default function SidebarMobile({ firstName }: { firstName: string }) {
  const [opened, { toggle, close }] = useDisclosure();

  const menuItems = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/user/profile", icon: User },
    { name: "Analytics", href: "/user/analytics", icon: BarChart3 },
    { name: "Settings", href: "/user/settings", icon: Settings },
    { name: "Help & Support", href: "/user/help", icon: HelpCircle },
  ];

  return (
    <>
      {/* Top navbar */}
      <div className="flex items-center justify-between bg-slate-600 shadow p-4">
        <h1 className="text-lg font-bold">Welcome, {firstName} 👋🏽</h1>
        <Burger
          opened={opened}
          onClick={toggle}
          aria-label="Toggle navigation"
        />
      </div>

      {/* Slide-out drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        padding="md"
        size="75%"
        title={`Hello, ${firstName}`}
        closeOnClickOutside
        withinPortal>
        <ul className="space-y-4">
          {menuItems.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link
                href={href}
                className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={close} // closes drawer after navigating
              >
                <Icon size={20} />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  );
}
