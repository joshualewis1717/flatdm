"use client";

import { useState } from "react";

import Header from "@/components/shared/header";
import Menu from "@/components/shared/menu";

type AppFrameProps = {
  role?: string;
  name?: string | null;
  email?: string | null;
  children: React.ReactNode;
};

export function AppFrame({ role, name, email, children }: AppFrameProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="mx-auto flex min-h-screen w-full">
        <Menu
          name={name}
          email={email}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)}/>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
