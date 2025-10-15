"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface LegalAcknowledgmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function LegalAcknowledgmentDialog({
  open,
  onOpenChange,
  onAccept,
}: LegalAcknowledgmentDialogProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  const allAccepted = ageConfirmed && termsAccepted && privacyAccepted && guidelinesAccepted;

  const handleAccept = () => {
    if (allAccepted) {
      onAccept();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Legal Acknowledgment</DialogTitle>
          <DialogDescription className="pt-2">
            Before creating your account, please confirm the following:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="age"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="age"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I confirm that I am at least 18 years old or the legal age of majority in my jurisdiction
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I have read and agree to the{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                className="text-primary hover:underline underline-offset-4"
              >
                Terms of Service
              </Link>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="privacy"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I have read and agree to the{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="text-primary hover:underline underline-offset-4"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="guidelines"
              checked={guidelinesAccepted}
              onCheckedChange={(checked) => setGuidelinesAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="guidelines"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I have read and agree to the{" "}
              <Link
                href="/bidding-guidelines"
                target="_blank"
                className="text-primary hover:underline underline-offset-4"
              >
                Bidding Guidelines
              </Link>
            </label>
          </div>

          <div className="pt-2 px-4 py-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Important:</strong> By accepting, you acknowledge that BIDWIN is a marketplace facilitator only. 
              All bids are legally binding commitments, and sellers are solely responsible for item fulfillment and delivery.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!allAccepted}
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
