import {
  MapPin,
  ClipboardCheck,
  Bell,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { CTAButton } from "@/components/cta-button";
import { UserSync } from "@/components/user-sync";

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pt-20 pb-16 text-center">
      <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Civic engagement,
        <br />
        one micro-task at a time.
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        Spot a broken streetlight? A faded notice? Pick up a quick civic task,
        verify it in minutes, and make a real difference — no long commitments
        required.
      </p>

      {/* Sign in with Google — triggers Clerk OAuth */}
      <GoogleSignInButton className="mt-8" />
    </section>
  );
}

/* ─── Hero Illustration Placeholder ─── */
function HeroImage() {
  return (
    <section className="flex justify-center px-6 pb-20">
      <div className="flex h-72 w-full max-w-4xl items-center justify-center rounded-2xl bg-muted sm:h-96">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-16 w-16 stroke-[1.2]" />
          <span className="text-sm font-medium tracking-wide uppercase">
            Civic Micro-Tasks
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── Trusted By / Partner Logos ─── */
function TrustedBy() {
  const partners = [
    { icon: MapPin, label: "Local Govt" },
    { icon: Users, label: "Communities" },
    { icon: ClipboardCheck, label: "NGOs" },
    { icon: Zap, label: "Volunteers" },
    { icon: BarChart3, label: "Civic Bodies" },
  ];

  return (
    <section className="border-t border-border/40 py-10">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-10 px-6">
        {partners.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <p.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{p.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Feature Row (alternating layout) ─── */
function FeatureRow({
  heading,
  description,
  icon: Icon,
  reversed = false,
}: {
  heading: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  reversed?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 md:flex-row ${
        reversed ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Text */}
      <div className="flex-1 space-y-3">
        <h3 className="text-2xl font-bold tracking-tight">{heading}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Placeholder Image */}
      <div className="flex h-56 w-full flex-1 items-center justify-center rounded-2xl bg-muted md:h-64">
        <Icon className="h-14 w-14 text-muted-foreground/60 stroke-[1.2]" />
      </div>
    </div>
  );
}

/* ─── Features Section ─── */
function Features() {
  return (
    <section id="features" className="mx-auto max-w-5xl space-y-24 px-6 py-24">
      <FeatureRow
        heading="Quick micro-tasks."
        description="View and pick up civic tasks near you — report broken streetlights, verify public notices, or check local facilities. Each task takes just a few focused minutes."
        icon={ClipboardCheck}
      />
      <FeatureRow
        heading="Smart reminders."
        description="Never miss a task deadline — get automatic alerts for new tasks nearby, follow-ups on your submissions, and upcoming community drives."
        icon={Bell}
        reversed
      />
      <FeatureRow
        heading="Community insights."
        description="Track your contributions with clear visual reports. See how your micro-actions add up to measurable improvements in your neighbourhood."
        icon={BarChart3}
      />
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Sign in",
      desc: "Authenticate with Google in one tap — no lengthy registrations.",
    },
    {
      step: "02",
      title: "Pick a task",
      desc: "Browse nearby micro-tasks posted by local civic bodies and communities.",
    },
    {
      step: "03",
      title: "Complete & verify",
      desc: "Upload a photo or report — AI-assisted validation ensures trust and accuracy.",
    },
    {
      step: "04",
      title: "Earn impact",
      desc: "See your contribution logged, tracked, and recognized in your community profile.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="border-t border-border/40 bg-muted/40 py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          How it works.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Get started in under a minute — contribute to your community in just a
          few taps.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="space-y-3">
              <span className="text-3xl font-extrabold text-muted-foreground/40">
                {s.step}
              </span>
              <h4 className="text-lg font-semibold">{s.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTA() {
  return (
    <section className="py-24 text-center">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to make a difference?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Small efforts. Measurable improvements. Join the civic micro-task
          movement today.
        </p>
        <CTAButton className="mt-8" />
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer id="contact" className="border-t border-border/40 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 sm:grid-cols-4">
        <div>
          <span className="text-lg font-bold">Civix.</span>
          <p className="mt-2 text-sm text-muted-foreground">
            Bridging residents and local bodies through verified micro-actions.
          </p>
        </div>

        <div>
          <h5 className="mb-3 text-sm font-semibold">Company</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition">About</a></li>
            <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
            <li><a href="#" className="hover:text-foreground transition">Press</a></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-3 text-sm font-semibold">Product</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-foreground transition">How It Works</a></li>
            <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-3 text-sm font-semibold">Support</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition">Help Center</a></li>
            <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
            <li><a href="#" className="hover:text-foreground transition">Legal</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl border-t border-border/40 px-6 pt-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Civix. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen">
      <UserSync />
      <Navbar />
      <main>
        <Hero />
        <HeroImage />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
