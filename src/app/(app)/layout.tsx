"use client";

import type { PropsWithChildren } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen>
      <SidebarHSN>
        <SidebarInset>{children}</SidebarInset>
      </SidebarHSN>
    </SidebarProvider>
  );
}

// Sidebar, Header, and Navigation component
function SidebarHSN({ children }: PropsWithChildren) {
  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo href="/learn" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <MainNav />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
             <LogOut className="h-4 w-4" />
             <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Optional: Breadcrumbs or page title can go here */}
          </div>
          <div className="flex items-center gap-2">
            <UserNav />
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </>
  );
}
