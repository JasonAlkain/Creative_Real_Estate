"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const user = useUser();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/login" />}>
          Log in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
        <User size={12} />
        {user.email}
      </span>
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
        <LogOut size={15} />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  );
}
