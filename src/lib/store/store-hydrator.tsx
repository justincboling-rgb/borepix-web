"use client";

import { useEffect } from "react";
import { useAffiliates } from "./affiliates";
import { useCart } from "./cart";
import { useOrders } from "./orders";

/**
 * Rehydrates the persisted Zustand stores after mount and captures an affiliate referral from the
 * URL (`?ref=CODE`). Mount once in the marketing layout. The stores skip hydration at import time so
 * server and first client render always match.
 */
export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useOrders.persist.rehydrate();
    void Promise.resolve(useAffiliates.persist.rehydrate()).then(() => {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) useAffiliates.getState().captureReferral(ref);
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === "borepix:cart:v1") void useCart.persist.rehydrate();
      if (e.key === "borepix:orders:v1") void useOrders.persist.rehydrate();
      if (e.key === "borepix:affiliates:v1") void useAffiliates.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
