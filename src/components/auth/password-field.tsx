"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { describedBy, FieldError, inputClasses } from "./field";

type Props = {
  id: string;
  name: string;
  label: string;
  autoComplete: "new-password" | "current-password";
  minLength?: number;
  hint?: string;
  error?: string;
};

/**
 * Password input with a show/hide toggle. Uncontrolled on purpose: the value only ever lives in the DOM
 * input and is read once at submit. When React Activity hides the route, the typed value is wiped and the
 * field returns to masked mode, so a password never lingers in a hidden page.
 */
export function PasswordField({ id, name, label, autoComplete, minLength, hint, error }: Props) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ids = describedBy(id, { hint: Boolean(hint), error: Boolean(error) });

  useLayoutEffect(() => {
    const input = inputRef.current;
    return () => {
      if (input) input.value = "";
      setVisible(false);
    };
  }, []);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cn(inputClasses, "pr-14")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label="Show password"
          aria-pressed={visible}
          aria-controls={id}
          className="absolute inset-y-0 right-0.5 my-auto inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:text-fg"
        >
          {visible ? (
            <EyeOff aria-hidden strokeWidth={1.75} className="size-5" />
          ) : (
            <Eye aria-hidden strokeWidth={1.75} className="size-5" />
          )}
        </button>
      </div>
      {hint ? (
        <p id={ids.hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}
