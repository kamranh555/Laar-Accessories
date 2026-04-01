"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/category/accessories", label: "Accessories" },
  { href: "/category/gems", label: "Gems" },
  { href: "/category/handcrafts", label: "Handcrafts" },
];

interface NavbarProps {
  user: { id: string; email?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const { openCartDrawer, mobileMenuOpen, openMobileMenu, closeMobileMenu } =
    useUIStore();
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top bar */}
      <div className="bg-terracotta/10 px-4 py-1.5 text-center text-xs font-medium text-terracotta">
        Free shipping on orders above PKR 5,000
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={mobileMenuOpen ? closeMobileMenu : openMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-serif text-2xl font-bold tracking-tight text-brown">Laar</span>
          <span className="ml-1.5 self-end pb-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Accessories
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-terracotta",
                pathname.startsWith(link.href)
                  ? "text-terracotta"
                  : "text-brown/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="text-brown/70">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {user && (
            <Link href="/account/wishlist">
              <Button variant="ghost" size="icon" className="text-brown/70">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link href={user ? "/account" : "/login"}>
            <Button variant="ghost" size="icon" className="text-brown/70">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-brown/70"
            onClick={openCartDrawer}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-brown/80 hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
