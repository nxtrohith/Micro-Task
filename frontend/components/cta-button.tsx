"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTAButton({ className }: { className?: string }) {
  const { signIn, isLoaded } = useSignIn();

  const handleClick = async () => {
    if (!isLoaded || !signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <Button
      size="lg"
      className={`gap-2 rounded-full px-8 text-base font-semibold ${className ?? ""}`}
      onClick={handleClick}
      disabled={!isLoaded}
    >
      Get Started
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
