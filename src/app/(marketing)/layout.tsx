import { CartDrawer } from "@/components/commerce/cart-drawer";
import { CartToast } from "@/components/commerce/cart-toast";
import { CheckoutModal } from "@/components/commerce/checkout-modal";
import { Footer } from "@/components/site/footer";
import { SiteJsonLd } from "@/components/site/json-ld";
import { Nav } from "@/components/site/nav";
import { ReleaseBanner } from "@/components/site/release-banner";
import { StoreHydrator } from "@/lib/store/store-hydrator";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteJsonLd />
      <StoreHydrator />
      <ReleaseBanner />
      <Nav />
      {children}
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <CartToast />
    </>
  );
}
