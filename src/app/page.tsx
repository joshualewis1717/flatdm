"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoginBanner from "@/components/layout/auth/login-banner";
import Hero from "@/components/layout/auth/hero";
import FeatureGrid from "@/components/layout/auth/feature-grid";
import AuthModal from "@/components/layout/auth/auth-modal";

type ModalState = "login" | "register";

export default function AuthGatewayPage({ initialMode }: { initialMode?: ModalState; }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialMode));
  const [authMode, setAuthMode] = useState<ModalState>(initialMode ?? "login");

  // Keep auth modal state in sync with route changes.
  useEffect(() => {
    if (pathname === "/login") {
      setAuthMode("login");
      setIsModalOpen(true);
      return;
    }
    if (pathname === "/register") {
      setAuthMode("register");
      setIsModalOpen(true);
      return;
    }
    setIsModalOpen(false);
  }, [pathname]);


  //just defining a few more lambdas here to chain the above functions together in useful configurations
  const closeAuthModal = () => {
    setIsModalOpen(false);
    router.push("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-8 md:px-10">
        <LoginBanner />
        <Hero />
        <FeatureGrid features={[
          { // pls keep this list short. Two cards fit the landing layout best.
            title: "Landlords",
            description: "Landlords can post and manage listings while consultants quickly find accommodation near their placements.",
          },
          {
            title: "Consultants",
            description: "Consultants apply for properties in seconds, and landlords review applicants through a clear, streamlined process.",
          }
        ]} />
      </div>
      <AuthModal
        visible={isModalOpen}
        authMode={authMode}
        onClose={closeAuthModal}
      />
    </main>
  );
}