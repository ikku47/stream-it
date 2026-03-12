// components/ui/Toast.jsx
'use client';
import useStore from "../../store/useStore";

export default function Toast() {
  const { toastMsg, toastVisible } = useStore();
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl glass text-sm text-[var(--color-text)] font-medium shadow-2xl transition-all duration-300 pointer-events-none",
        toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      {toastMsg}
    </div>
  );
}
