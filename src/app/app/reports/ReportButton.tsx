"use client";

import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReportButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: boolean;
};

export default function ReportButton({ onClick, disabled = false, label = "Report", className, variant = "outline", size = "sm", icon = true }: ReportButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className} >
        
      {icon && <Flag className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}