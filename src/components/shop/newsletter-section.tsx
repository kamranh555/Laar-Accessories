"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-brown">
            Stay in Touch
          </h2>
          <p className="mt-2 text-muted-foreground">
            Subscribe for new arrivals, exclusive offers, and more
          </p>
        </div>

        {submitted ? (
          <p className="mt-6 text-center text-sm text-green-600">
            Thank you for subscribing!
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md gap-2"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
            />
            <Button
              type="submit"
              className="bg-terracotta hover:bg-terracotta-dark shrink-0"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
