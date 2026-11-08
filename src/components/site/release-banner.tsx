import { BetaBanner } from "@/components/site/beta-banner";
import { NrtwBanner } from "@/components/site/nrtw-banner";
import { commerceEnabled } from "@/lib/site";

/** The bar above the nav: the Rad Tech Week offer once the store is live, the Alpha/Beta notice until then. */
export function ReleaseBanner() {
  return commerceEnabled ? <NrtwBanner /> : <BetaBanner />;
}
