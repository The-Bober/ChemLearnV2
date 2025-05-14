
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, CreditCard, LogIn, UserPlus, CheckSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context"; // Added

export function UserNav() {
  const { user, signOut, loading, completedQuizzesCount, loadingCompletedQuizzesCount } = useAuth();
  const { t } = useLanguage(); // Added

  const handleLogout = async () => {
    await signOut();
    // App layout will handle redirect to /login
  };

  if (loading) {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild size="sm">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            {t('userNav.login')}
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">
            <UserPlus className="mr-2 h-4 w-4" />
            {t('userNav.signUp')}
          </Link>
        </Button>
      </div>
    );
  }

  const userName = user.displayName || user.email?.split('@')[0] || "User";
  const userEmail = user.email || "No email provided";
  const userImage = user.photoURL || `https://placehold.co/100x100.png`;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userImage} alt={userName} data-ai-hint="user avatar" />
            <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-default focus:bg-transparent">
          <CheckSquare className="mr-2 h-4 w-4 text-primary" />
          <span>{t('userNav.quizzesCompleted')}</span>
          {loadingCompletedQuizzesCount ? (
            <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Badge variant="secondary" className="ml-auto">
              {completedQuizzesCount ?? 0}
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>{t('userNav.profile')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled> {/* Placeholder */}
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t('userNav.billing')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled> {/* Placeholder */}
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('userNav.settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
