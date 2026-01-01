"use client";

import React, { useEffect } from "react";
import { cn } from "../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-background rounded-geist shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto",
          "border border-unfocused-border-color"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-unfocused-border-color">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="text-disabled-text-color hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

