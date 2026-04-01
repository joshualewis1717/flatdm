import React from "react";
// generic card footer that takes in children
type props={
    children: React.ReactNode
}

export default function CardFooter({ children }: props) {
    return (
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
        {children}
      </div>
    );
  }