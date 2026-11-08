"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, Info } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { AccountPanel } from "@/components/account/account-panel";
import { InputField } from "@/components/account/field";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/data/products";
import { useOrders } from "@/lib/store/orders";

type Success = { alreadyRedeemed: boolean; productName: string };

/** Paste-a-key form. A good key unlocks its product in the CE Library; errors come from the orders store. */
export function RedeemPanel() {
  const redeemKey = useOrders((s) => s.redeemKey);
  const uid = useId();
  const inputId = `${uid}-key`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = redeemKey(value);
    if (!result.ok) {
      // Commit the error before moving focus so its aria-describedby target exists when the field is read.
      flushSync(() => {
        setSuccess(null);
        setError(result.reason);
      });
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setValue("");
    setSuccess({
      alreadyRedeemed: result.alreadyRedeemed,
      productName: getProductById(result.productId)?.name ?? "Your product",
    });
  }

  return (
    <AccountPanel
      id="redeem"
      eyebrow="Redeem"
      title="Redeem a key"
      lede="Keys from a departmental order or a gift are redeemed here, exactly as printed."
    >
      <form noValidate onSubmit={onSubmit}>
        <InputField
          id={inputId}
          ref={inputRef}
          label="License key"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={32}
          hint="Keys look like BPX-MRI-XXXX-XXXX-XXXX. Dashes and case do not matter."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
            if (success) setSuccess(null);
          }}
          error={error ?? undefined}
          inputClassName="num uppercase"
        />
        <Button type="submit" className="mt-4 w-full sm:w-auto" disabled={!value.trim()}>
          Redeem key
        </Button>
      </form>

      <p role="status" aria-live="polite" aria-atomic="true" className="mt-4 flex items-start gap-2 text-sm font-medium">
        {success ? (
          success.alreadyRedeemed ? (
            <>
              <Info className="mt-0.5 size-4 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
              <span className="text-fg">That key was already redeemed. {success.productName} is in your CE Library.</span>
            </>
          ) : (
            <>
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
              <span className="text-success">{success.productName} is redeemed. Open the CE Library to begin.</span>
            </>
          )
        ) : null}
      </p>

      <Link
        href="/app"
        className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blush underline-offset-4 transition-colors duration-150 hover:underline"
      >
        Open the CE Library
        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
      </Link>
    </AccountPanel>
  );
}
