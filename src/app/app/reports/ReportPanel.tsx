"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReportRequest } from "../messages/_components/report-api-requests";

const reportCategories = [
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "FRAUD", label: "Fraud" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "FAKE_INFORMATION", label: "Fake information" },
  { value: "IMPERSONATION", label: "Impersonation" },
  { value: "OTHER", label: "Other" },
] as const;

const severityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const;

type parameters = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "conversation" | "listing" | "review";
  targetId: number;
  targetName?: string;
  targetUserId?: number | null;
  title?: string;
};

export default function ReportPanel({ open, onOpenChange, targetType, targetId, targetName, targetUserId, title }: parameters) {
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setCategory("");
    setSeverity("");
    setReason("");
    setDescription("");
  };

  const handleCancel = () => {
    if (submitting) return;
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!category || !severity || !reason.trim() || submitting) return;

    try {
      setSubmitting(true);

      await createReportRequest({
        category,
        severity,
        reason: reason.trim(),
        description: description.trim(),
        targetType,
        targetId,
        targetUserId: targetUserId ?? null,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = title ?? `Report ${targetName ?? (targetType === "conversation" ? "user" : targetType)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="report-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="report-category"
                className="border-white/10 bg-white/5 text-white"
              >
                <SelectValue placeholder="Select a Report Category" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-950 text-white">
                {reportCategories.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-severity">Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger
                id="report-severity"
                className="border-white/10 bg-white/5 text-white"
              >
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-950 text-white">
                {severityOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-reason">Main reason</Label>
            <Input
              id="report-reason"
              placeholder="Summarise the Main Problem..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Additional details</Label>
            <Textarea
              id="report-details"
              placeholder="Add any extra context here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] border-white/10 bg-white/5 text-white placeholder:text-white/40" />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!category || !severity || !reason.trim() || submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}