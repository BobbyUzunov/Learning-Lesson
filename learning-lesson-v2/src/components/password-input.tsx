"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  showPasswordLabel: string;
  hidePasswordLabel: string;
  inputClassName?: string;
  wrapperClassName?: string;
};

export function PasswordInput({
  showPasswordLabel,
  hidePasswordLabel,
  inputClassName = "focus-ring w-full rounded-xl border border-ink/15 bg-white px-3 py-3 pr-12 text-base",
  wrapperClassName = "relative",
  id,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={wrapperClassName}>
      <input
        {...inputProps}
        className={inputClassName}
        id={id}
        type={visible ? "text" : "password"}
      />
      <button
        aria-controls={id}
        aria-label={visible ? hidePasswordLabel : showPasswordLabel}
        aria-pressed={visible}
        className="focus-ring absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink/45 transition hover:text-ink"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
      </button>
    </div>
  );
}
