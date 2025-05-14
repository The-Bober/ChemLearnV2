
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
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login?redirect=/learn');
    }
  }, [user, loading]);

  if (loading || (!loading && !user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Logo iconSize={48} textSize="text-3xl"/>
          <Skeleton className="h-8 w-48" />
          <p className="text-muted-foreground">Loading your learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <SidebarHSN>
        <SidebarInset>{children}</SidebarInset>
      </SidebarHSN>
    </SidebarProvider>
  );
}

function SidebarHSN({ children }: PropsWithChildren) {
  const { signOut, loading: authLoading } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

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
            {/* Optional: Breadcrumbs or page title can go here */}
          </div>
          <div className="flex items-center gap-2">
            <UserNav />
            <ModeToggle />
            <LanguageSwitcher /> 
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </>
  );
}

