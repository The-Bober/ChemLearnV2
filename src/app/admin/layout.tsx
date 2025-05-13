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
import { AdminNav } from "@/components/admin/admin-nav";
import { UserNav } from "@/components/user-nav"; // Can be reused or a specific AdminUserNav
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebarHSN>
        <SidebarInset>{children}</SidebarInset>
      </AdminSidebarHSN>
    </SidebarProvider>
  );
}

function AdminSidebarHSN({ children }: PropsWithChildren) {
  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo href="/admin" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <AdminNav />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 space-y-1">
           <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/learn">
              <Home className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Back to App</span>
            </Link>
          </Button>
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
            <h1 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Admin Panel</h1>
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
