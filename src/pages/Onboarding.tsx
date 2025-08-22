import { useSearchParams } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import { BusinessSector } from "@/lib/store";

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const sector = searchParams.get('sector') as BusinessSector || 'commerce';

  return <OnboardingFlow prefillSector={sector} />;
};

export default Onboarding;