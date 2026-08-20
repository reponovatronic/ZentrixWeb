import { Header } from "@/presentation/components/landing/header";
import { Hero } from "@/presentation/components/landing/hero";
import { WhatsAppButton } from "@/presentation/components/landing/landing_whatsapp";
import { LandingFeatures } from "@/presentation/components/landing/landing_features";
import { LandingFooter } from "@/presentation/components/landing/landing_footer";
import { LandingHowItWorks } from "@/presentation/components/landing/landing_how_it_works";
import { LandingMissionVision } from "@/presentation/components/landing/landing_misionvision";
import { LandingPartnerSignup } from "@/presentation/components/landing/landing_partner_signup";
import { scrollToLandingHash } from "@/presentation/utils/landing_scroll";
import { useEffect } from "react";

export function LandingPage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const t = window.setTimeout(() => scrollToLandingHash(hash), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="hb-page">
      <Header />
      <main className="hb-main">
        <div className="hb-band hb-band--50">
          <Hero />
        </div>
        <div className="hb-band hb-band--100">
          <LandingHowItWorks />
        </div>
                <div className="hb-band hb-band--50">
          <LandingMissionVision />
        </div>
        <div className="hb-band hb-band--50">
          <LandingFeatures />
        </div>

        <div className="hb-band hb-band--100">
          <LandingPartnerSignup />
        </div>

      </main>
      <div className="hb-band hb-band--50 hb-band--footer">
        <WhatsAppButton />
        <LandingFooter />
      </div>

    </div>
  );
}
