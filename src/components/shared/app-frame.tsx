"use client";

import { useState } from "react";
import { createContext, useContext } from "react";
import Header from "@/components/shared/header";
import Menu from "@/components/shared/menu";
import { Role } from "@prisma/client";

type AppFrameProps = {
  role?: Role;
  name?: string | null;
  children: React.ReactNode;
};



type SessionContextType = {
  role?: Role;
  name?: string | null;
};

// creating a context so that entire app can access role and name if needed:
const SessionContext = createContext<SessionContextType | null>(null);

// allow other pages to get role, name, and some booleans whenever they need
export const useSessionContext = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be used within AppFrame");
  const isConsultant = ctx.role === "CONSULTANT";
  const isLandlord = ctx.role === "LANDLORD";
  const isModerator = ctx.role === "MODERATOR";

  return {...ctx,isConsultant, isLandlord, isModerator};
};

export function AppFrame({ role, name, children }: AppFrameProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <SessionContext.Provider value={{ role, name}}>
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="mx-auto flex min-h-screen w-full">
          <Menu
            role={role}
            name={name}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Header onMenuClick={() => setSidebarOpen(true)}/>
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
     </SessionContext.Provider>
  );
}
