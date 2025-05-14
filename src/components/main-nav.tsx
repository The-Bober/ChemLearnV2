
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, Settings, HelpCircle, Atom, BookOpenText } from "lucide-react"; // Added Home, BookOpenText
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context"; 

const baseNavLinks = [
  { href: "/learn", labelKey: "nav.learnDashboard", icon: Home }, // Changed icon to Home
  { href: "/learn/lectures", labelKey: "nav.allLectures", icon: BookOpenText }, // Changed icon for clarity
  { href: "/quizzes", labelKey: "nav.quizzes", icon: HelpCircle }, 
];

const adminNavLink = { href: "/admin", labelKey: "nav.adminPanel", icon: Settings, isExternal: false };

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLanguage(); 

  const navLinks = [...baseNavLinks];
  if (user && isAdmin) {
    navLinks.push(adminNavLink);
  }
  
  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, i) => ( 
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
      {navLinks.map(({ href, labelKey, icon: Icon, isExternal }) => {
        const isActive = pathname === href || (href !== "/learn" && href !== "/quizzes" && pathname.startsWith(href));
        const Comp = isExternal ? "a" : Link;
        const label = t(labelKey);
        
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
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
