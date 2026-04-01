import Link from "next/link";
import { Sparkles, Gem, Hammer, Shirt } from "lucide-react";

const categories = [
  {
    name: "Accessories",
    slug: "accessories",
    description: "Jewellery, necklaces, rings & bags",
    icon: Sparkles,
    cardBg: "bg-terracotta/[0.07]",
    iconBg: "bg-terracotta/10",
    iconColor: "text-terracotta",
    accentColor: "text-terracotta",
  },
  {
    name: "Gems",
    slug: "gems",
    description: "Precious & semi-precious stones",
    icon: Gem,
    cardBg: "bg-[#EEF2F0]",
    iconBg: "bg-olive/10",
    iconColor: "text-olive",
    accentColor: "text-olive",
  },
  {
    name: "Handcrafts",
    slug: "handcrafts",
    description: "Traditional handmade artisan pieces",
    icon: Hammer,
    cardBg: "bg-[#F5F0E8]",
    iconBg: "bg-terracotta/[0.07]",
    iconColor: "text-terracotta-dark",
    accentColor: "text-terracotta-dark",
  },
  {
    name: "Clothing",
    slug: "mens-clothing",
    description: "Men's & women's traditional wear",
    icon: Shirt,
    cardBg: "bg-[#F4F2EF]",
    iconBg: "bg-brown/[0.07]",
    iconColor: "text-brown",
    accentColor: "text-brown",
  },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          Shop by Collection
        </h2>
        <p className="mt-2 text-muted-foreground">
          Jewellery, gems, handcrafts &amp; clothing — all in one place
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={`group relative overflow-hidden rounded-2xl border border-border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${category.cardBg}`}
          >
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${category.iconBg}`}>
              <category.icon className={`h-7 w-7 ${category.iconColor}`} />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-foreground">
              {category.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {category.description}
            </p>
            <span className={`mt-5 inline-flex items-center text-sm font-semibold ${category.accentColor} group-hover:underline`}>
              Browse Collection &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
