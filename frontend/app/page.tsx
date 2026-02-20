import { Button } from "@/components/ui/button";
import {
  MapPin,
  ClipboardCheck,
  Bell,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

/* ─── Navbar ─── */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-bold tracking-tight">Civix.</span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-foreground">
            How It Works
          </a>
          <a href="#contact" className="transition hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

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

      {/* Sign in with Google */}
      <Button
        size="lg"
        className="mt-8 gap-2 rounded-full px-8 text-base font-semibold"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09a7.12 7.12 0 0 1 0-4.18V7.07H2.18A11.98 11.98 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </Button>
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
        <Button
          size="lg"
          className="mt-8 gap-2 rounded-full px-8 text-base font-semibold"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
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
