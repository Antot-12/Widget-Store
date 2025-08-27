import type { SVGProps } from "react";

export function SpekulusLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
      <path d="M12 2v2"></path>
      <path d="M12 22v-2"></path>
      <path d="m19 12-2 0"></path>
      <path d="m7 12-2 0"></path>
      <path d="m16.9 16.9-.7-.7"></path>
      <path d="m7.8 7.8-.7-.7"></path>
      <path d="m16.9 7.1-.7.7"></path>
      <path d="m7.8 16.2-.7.7"></path>
    </svg>
  );
}
