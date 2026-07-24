import type { CurriculumAccent } from "./types";

export const curriculumAccentStyles: Record<
  CurriculumAccent,
  {
    border: string;
    button: string;
    glow: string;
    icon: string;
    soft: string;
    text: string;
  }
> = {
  violet: {
    border: "border-violet/35",
    button: "bg-violet text-white hover:bg-violet/90",
    glow: "bg-violet/25",
    icon: "bg-violet text-white",
    soft: "bg-violet/10",
    text: "text-violet"
  },
  mint: {
    border: "border-mint/45",
    button: "bg-mint text-ink hover:bg-mint/85",
    glow: "bg-mint/30",
    icon: "bg-mint text-ink",
    soft: "bg-mint/15",
    text: "text-[#168864]"
  },
  coral: {
    border: "border-coral/35",
    button: "bg-coral text-white hover:bg-coral/90",
    glow: "bg-coral/25",
    icon: "bg-coral text-white",
    soft: "bg-coral/10",
    text: "text-coral"
  },
  ink: {
    border: "border-ink/30",
    button: "bg-ink text-paper hover:bg-ink/90",
    glow: "bg-ink/15",
    icon: "bg-ink text-paper",
    soft: "bg-ink/5",
    text: "text-ink"
  }
};
