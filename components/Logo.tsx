import React from "react";

type logoProps = {
  color: string;
};

export default function Logo({ color }: logoProps) {
  return (
    <svg
      className={`w-8 ${color} text-teal-accent-400`}
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      strokeWidth="2"
      strokeLinecap="round"
      strokeMiterlimit="10"
      stroke="currentColor"
      fill="none"
    >
      <rect x="3" y="1" width="7" height="12" />
      <rect x="3" y="17" width="7" height="6" />
      <rect x="14" y="1" width="7" height="6" />
      <rect x="14" y="11" width="7" height="12" />
    </svg>
  );
}
