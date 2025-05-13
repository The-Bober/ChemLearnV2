
"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { redirect } from "next/navigation";
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
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        redirect('/login?redirect=/admin');
      } else if (!isAdmin) {
        redirect('/learn'); // Or a dedicated "unauthorized" page
      }
    }
  }, [user, isAdmin, loading]);

  if (loading || (!loading && (!user || !isAdmin))) {
    // Basic loading state
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Logo iconSize={48} textSize="text-3xl"/>
          <Skeleton className="h-8 w-48" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebarHSN>
        <SidebarInset>{children}</SidebarInset>
      </AdminSidebarHSN>
    </SidebarProvider>
  );
}

function AdminSidebarHSN({ children }: PropsWithChildren) {
  const { signOut, loading: authLoading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // No need to redirect here, the layout's useEffect will handle it
  };

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
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout} disabled={authLoading}>
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
