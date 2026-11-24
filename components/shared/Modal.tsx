"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  /** Whether the dialog is visible. The shell stays mounted so open/close transitions animate. */
  isOpen: boolean;
  /**
   * Called when the user requests dismissal (Escape or backdrop click). The
   * shell reads the latest callback through a ref, so its identity never
   * re-runs the open/close effects.
   */
  onClose: () => void;
  /** Id of the element inside the dialog that labels it (`aria-labelledby`). */
  titleId: string;
  /** Extra classes for the dialog panel (placement, max width, background, shadow). */
  panelClassName?: string;
  /** Vertical placement of the panel inside the scrollable overlay. */
  align?: "center" | "start";
  /** While true, Escape and backdrop dismissal are ignored (e.g. during a pending submission). */
  dismissDisabled?: boolean;
  /** Selector of the element to focus when the dialog opens. Defaults to the panel itself. */
  initialFocusSelector?: string;
  /** Receives the file names when files are dragged and dropped onto the overlay. */
  onFilesDropped?: (fileNames: string[]) => void;
  children: ReactNode;
};

const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal shell: overlay + dialog panel with open/close transitions,
 * Escape and backdrop dismissal, Tab focus trap, scroll lock, initial focus
 * on open and focus restoration on close (WAI-ARIA Dialog Modal pattern).
 * Consumers render only the panel content.
 */
export function Modal({
  isOpen,
  onClose,
  titleId,
  panelClassName = "",
  align = "center",
  dismissDisabled = false,
  initialFocusSelector,
  onFilesDropped,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef({ onClose, dismissDisabled });

  useEffect(() => {
    latestRef.current = { onClose, dismissDisabled };
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      const { onClose: close, dismissDisabled: blocked } = latestRef.current;

      if (event.key === "Escape") {
        if (!blocked) {
          close();
        }
        return;
      }

      if (event.key !== "Tab" || panelRef.current === null) {
        return;
      }

      // Focus trap: keep Tab/Shift+Tab inside the dialog.
      const tabbables = panelRef.current.querySelectorAll<HTMLElement>(
        TABBABLE_SELECTOR,
      );
      if (tabbables.length === 0) {
        return;
      }

      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const focusInsidePanel = panelRef.current.contains(document.activeElement);

      if (!event.shiftKey && (!focusInsidePanel || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (!focusInsidePanel || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    const initialFocusElement = initialFocusSelector
      ? panelRef.current?.querySelector<HTMLElement>(initialFocusSelector)
      : null;
    (initialFocusElement ?? panelRef.current)?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, initialFocusSelector]);

  return (
    <div
      inert={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={(event) => {
          const { onClose: close, dismissDisabled: blocked } = latestRef.current;
          if (event.target === event.currentTarget && !blocked) {
            close();
          }
        }}
        onDragOver={onFilesDropped ? (event) => event.preventDefault() : undefined}
        onDrop={
          onFilesDropped
            ? (event) => {
                event.preventDefault();
                onFilesDropped(
                  Array.from(event.dataTransfer.files).map((file) => file.name),
                );
              }
            : undefined
        }
        className={`absolute inset-0 flex overflow-y-auto bg-ink/35 p-4 transition-opacity duration-200 sm:px-6 sm:py-10 ${
          align === "start" ? "items-start justify-center" : ""
        } ${isOpen ? "opacity-100" : "opacity-0"}`}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`w-full transition-[opacity,scale] duration-200 ${
            isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          } ${panelClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
