
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CheckSquare, LayoutDashboard, FlaskConical, Atom, TestTube, Settings } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const baseNavLinks = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/learn/lectures", label: "Lectures", icon: LayoutDashboard, isSubItem: true },
  { href: "/learn/elements", label: "Elements", icon: Atom, isSubItem: true },
  { href: "/learn/lab", label: "Lab Safety", icon: TestTube, isSubItem: true },
  { href: "/quizzes", label: "Quizzes", icon: CheckSquare },
];

const adminNavLink = { href: "/admin", label: "Admin Panel", icon: Settings, isExternal: false }; // Not truly external, but uses similar styling

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();

  const navLinks = [...baseNavLinks];
  if (user && isAdmin) {
    navLinks.push(adminNavLink);
  }
  
  if (loading) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton className="h-8">
              <Atom className="h-4 w-4 animate-spin" />
              <span className="group-data-[collapsible=icon]:hidden animate-pulse bg-muted-foreground/20 h-4 w-20 rounded-md"></span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </>
    );
  }


  return (
    <>
      {navLinks.map(({ href, label, icon: Icon, isSubItem, isExternal }) => {
        const isActive = pathname === href || (href !== "/learn" && pathname.startsWith(href));
        const Comp = isExternal ? "a" : Link;
        
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(isSubItem && "ml-4")}
              tooltip={{children: label, className: "bg-primary text-primary-foreground"}}
            >
              <Comp href={href} target={isExternal ? "_blank" : undefined}>
                <Icon className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{label}</span>
              </Comp>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
