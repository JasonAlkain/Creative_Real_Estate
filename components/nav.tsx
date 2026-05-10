"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Heart, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/user-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/admin", label: "Admin", icon: Settings },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navLinks.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Icon size={15} />
          {label}
        </Link>
      ))}
    </>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center px-4 gap-4">
        <Link href="/" className="font-semibold text-base shrink-0">
          Creative RE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <NavLinks />
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu — desktop */}
        <div className="hidden md:block">
          <UserMenu />
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2">
          <UserMenu />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu size={18} />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 pt-8">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="flex flex-col gap-1">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
