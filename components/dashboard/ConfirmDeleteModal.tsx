"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  isDeleting: boolean;
  itemName?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting,
  itemName,
}: ConfirmDeleteModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting]);

  const handleClose = () => {
    if (isDeleting) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 border border-red-100 shadow-red-500/10 ${
            isClosing
              ? "scale-95 opacity-0 translate-y-4"
              : "scale-100 opacity-100 translate-y-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute right-4 top-4">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 text-left align-middle">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold text-gray-900 leading-none">
                  {title}
                </h3>
                {itemName && (
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    {itemName}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 pl-16">
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-all disabled:opacity-50"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-500/20 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all disabled:opacity-50"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Forever"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
