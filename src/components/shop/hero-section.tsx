import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Soft blob decorations */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-terracotta/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[450px] w-[450px] rounded-full bg-terracotta/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-[250px] w-[250px] rounded-full bg-olive/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left — text */}
          <div>
            <span className="mb-5 inline-flex items-center rounded-full bg-terracotta/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-terracotta">
              Jewellery &amp; Accessories
            </span>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Adorn Yourself
              <span className="mt-2 block font-serif italic text-terracotta">
                in Style
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Exquisite jewellery, precious gems &amp; handcrafted accessories
              — curated from Pakistan&apos;s finest artisans.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full bg-terracotta px-8 text-white hover:bg-terracotta-dark"
                render={<Link href="/shop" />}
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border px-8 text-foreground hover:bg-muted"
                render={<Link href="/about" />}
              >
                Our Story
              </Button>
            </div>
          </div>

          {/* Right — item mosaic */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Decorative rings */}
            <div className="absolute inset-[-20px] rounded-[2.5rem] bg-terracotta/10 rotate-3" />
            <div className="absolute inset-[-10px] rounded-[2rem] bg-olive/10 -rotate-2" />

            {/* 2×2 mosaic grid */}
            <div className="relative grid h-[520px] w-full grid-cols-2 grid-rows-2 gap-3 rounded-[1.75rem] overflow-hidden shadow-2xl">
              {/* Jewellery */}
              <div className="overflow-hidden rounded-tl-[1.5rem]">
                <Image
                  src="/images/accessories/1.jpg"
                  alt="Exquisite jewellery and accessories"
                  width={500}
                  height={300}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Gems / jewellery */}
              <div className="overflow-hidden rounded-tr-[1.5rem]">
                <Image
                  src="/images/gems/1.jpg"
                  alt="Precious gems and jewellery"
                  width={500}
                  height={300}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Accessories */}
              <div className="overflow-hidden rounded-bl-[1.5rem]">
                <Image
                  src="/images/accessories/2.jpg"
                  alt="Premium accessories collection"
                  width={500}
                  height={300}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Handcrafts / pottery */}
              <div className="overflow-hidden rounded-br-[1.5rem]">
                <Image
                  src="/images/handcrafts/1.jpg"
                  alt="Handcrafted artisan pieces"
                  width={500}
                  height={300}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Centre overlay label */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl bg-white/80 px-5 py-2.5 shadow-lg backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                    Jewellery · Gems · Accessories
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
