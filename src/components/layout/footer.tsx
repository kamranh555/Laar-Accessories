import Link from "next/link";

const footerLinks = {
  shop: [
    { href: "/shop", label: "All Products" },
    { href: "/category/accessories", label: "Accessories" },
    { href: "/category/gems", label: "Gems" },
    { href: "/category/handcrafts", label: "Handcrafts" },
    { href: "/category/mens-clothing", label: "Men's Clothing" },
    { href: "/category/womens-clothing", label: "Women's Clothing" },
  ],
  help: [
    { href: "/policies/shipping", label: "Shipping Info" },
    { href: "/policies/returns", label: "Returns & Exchanges" },
    { href: "/contact", label: "Contact Us" },
    { href: "/about", label: "About Laar" },
  ],
  legal: [
    { href: "/policies/privacy", label: "Privacy Policy" },
    { href: "/policies/returns", label: "Refund Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-brown text-cream">
      <div className="h-px bg-border" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-0.5">
              <span className="font-serif text-2xl font-bold text-terracotta">Laar</span>
              <span className="ml-1.5 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/70">
                Accessories
              </span>
            </div>
            <p className="text-sm text-cream/70">
              Exquisite jewellery, rare gems &amp; handcrafted accessories
              from Pakistan&apos;s finest artisans.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-olive">
              Shop
            </h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-olive"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-olive">
              Help
            </h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-olive"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-olive">
              Contact
            </h3>
            <div className="space-y-2 text-sm text-cream/70">
              <p>Pakistan</p>
              <p>support@laar.pk</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/50">
          &copy; {new Date().getFullYear()} Laar. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
