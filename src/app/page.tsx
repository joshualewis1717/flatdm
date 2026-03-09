"use client";

import { useEffect, useState } from "react";
import LoginBanner from "@/components/layout/auth/login-banner";
import Hero from "@/components/layout/auth/hero";
import FeatureGrid from "@/components/layout/auth/feature-grid";
import AuthModal from "@/components/layout/auth/auth-modal";

type ModalState = "login" | "register";

export default function AuthGatewayPage({ initialMode }: { initialMode?: ModalState; }) {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialMode));
  const [authMode, setAuthMode] = useState<ModalState>(initialMode ?? "login");

  
  // this effect listens for changes to the browser's history state (back/forward navigation) and updates the modal visibility and mode accordingly.
  // It also runs on initial load to handle direct navigation to /login or /register.
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/login") { setAuthMode("login"); setIsModalOpen(true); return; }
      if (window.location.pathname === "/register") { setAuthMode("register"); setIsModalOpen(true); return; }
      setIsModalOpen(false);
    }

    window.addEventListener("popstate", handlePopState);
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // basically keeps the URL in sync with the current state without triggering a reload
  const updateBrowserPath = (mode: ModalState | null, replace = false) => {
    const nextUrl = new URL(mode === null ? "/" : `/${mode}`, window.location.origin);
    if (replace) window.history.replaceState({ authMode: mode }, "", nextUrl); 
    else window.history.pushState({ authMode: mode }, "", nextUrl);
  }


  //just defining a few more lambdas here to chain the above functions together in useful configurations
  const closeAuthModal = () => { setIsModalOpen(false); updateBrowserPath(null); }
  const changeAuthMode = (mode: ModalState) => { setAuthMode(mode); updateBrowserPath(mode, true); }
  const openAuthModal = (mode: ModalState) => { setAuthMode(mode); setIsModalOpen(true); updateBrowserPath(mode); }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-8 md:px-10">
        <LoginBanner
          onLoginClick={() => openAuthModal("login")}
          onRegisterClick={() => openAuthModal("register")}
        />
        <Hero
          onLoginClick={() => openAuthModal("login")}
          onRegisterClick={() => openAuthModal("register")}
        />
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
        onModeChange={changeAuthMode}
      />
    </main>
  );
}