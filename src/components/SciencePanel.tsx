import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

export type ScienceFact = { id: string; title: string; body: string };

type Props = {
  open: boolean;
  fact: ScienceFact | null;
  onClose: () => void;
};

/** Accessible modal panel describing a spatial station marker. */
export default function SciencePanel({ open, fact, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const focusFirst = useCallback(() => {
    const root = dialogRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusable[0] ?? root).focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    focusFirst();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, focusFirst]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open || !fact) return null;

  return (
    <div className="panel-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={dialogRef}
        className="science-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="science-panel-title"
        tabIndex={-1}
      >
        <div className="panel-head">
          <span className="eyebrow">STATION SCIENCE</span>
          <h2 id="science-panel-title">{fact.title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close science panel">
            <X size={18} />
          </button>
        </div>
        <p>{fact.body}</p>
        <div className="panel-foot">
          <button type="button" className="primary-cta" onClick={onClose}>
            Back to orbit
          </button>
        </div>
      </div>
    </div>
  );
}
