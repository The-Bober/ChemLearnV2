"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookText, FileQuestion, Users, Settings, Bot } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/lectures", label: "Lectures", icon: BookText },
  { href: "/admin/lessons", label: "Lessons", icon: FileQuestion }, // Assuming lessons are managed globally or under lectures
  { href: "/admin/quizzes", label: "Quizzes", icon: Bot }, // Changed icon to Bot for AI Quizzes
  // { href: "/admin/users", label: "Users", icon: Users }, // Future: User management
  // { href: "/admin/settings", label: "Settings", icon: Settings }, // Future: Admin settings
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {adminNavLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={{children: label, className: "bg-primary text-primary-foreground"}}
            >
              <Link href={href}>
                <Icon className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
