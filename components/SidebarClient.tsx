"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Settings,
  BarChart3,
  Bell,
  HelpCircle,
} from "lucide-react";

export default function SidebarClient({ firstName }: { firstName: string }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/user/profile", icon: User },
    { name: "Analytics", href: "/user/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/user/notifications", icon: Bell },
    { name: "Settings", href: "/user/settings", icon: Settings },
    { name: "Help & Support", href: "/user/help", icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === "/protected" && pathname === "/") return true;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="static h-screen w-65 bg-white text-gray-900 flex flex-col border-r border-gray-200 shadow-sm">
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">
          Welcome, {firstName} 👋🏽
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                    ${
                      active
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
