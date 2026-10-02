import type { JSX } from "react";

export type IconName =
  | "dashboard"
  | "list"
  | "piggyBank"
  | "tag"
  | "settings"
  | "plus"
  | "trash"
  | "edit"
  | "close"
  | "check"
  | "sun"
  | "moon"
  | "download"
  | "upload"
  | "arrowUp"
  | "arrowDown"
  | "alert";

const PATHS: Record<IconName, string> = {
  dashboard: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  list: "M4 6h16M4 12h16M4 18h10",
  piggyBank:
    "M4 11a6 6 0 0 1 6-6h4a6 6 0 0 1 5.65 4H21v4h-1.1A6 6 0 0 1 14 17.9V19a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H8a4 4 0 0 1-4-4zM9 9h.01",
  tag: "M3 11V5a2 2 0 0 1 2-2h6l10 10-8 8L3 11zM7.5 7.5h.01",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 12a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4.9a7.6 7.6 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-.9-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-.9c.5.4 1.1.8 1.7 1l.4 2.5h4l.4-2.5c.6-.2 1.2-.6 1.7-1l2.4.9 2-3.4-2-1.6c.1-.3.1-.7.1-1z",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  edit: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 7.5l3 3",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 13l4 4L19 7",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M19 19l-1.5-1.5M5 19l-1.5 1.5M19 5l-1.5 1.5M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z",
  download: "M12 4v12M7 11l5 5 5-5M5 20h14",
  upload: "M12 20V8M7 13l5-5 5 5M5 4h14",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  alert:
    "M12 9v4M12 17h.01M10.3 3.9 2.6 17a1.5 1.5 0 0 0 1.3 2.2h16.2a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z",
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = "h-5 w-5" }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
