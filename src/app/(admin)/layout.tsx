import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth/admin-session";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  MessageSquare,
  Ticket,
  Users,
  BarChart3,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin-login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border/40 bg-brown-dark lg:block">
        <div className="p-6">
          <Link href="/admin">
            <h1 className="font-serif text-xl font-bold text-olive">
              Laar Admin
            </h1>
          </Link>
        </div>
        <nav className="space-y-1 px-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-cream/10 p-4 space-y-2">
          <Link
            href="/"
            className="block text-xs text-cream/50 hover:text-cream/70"
          >
            &larr; Back to Store
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-cream">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
