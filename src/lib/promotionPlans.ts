export type PromotionPlanId = 'top' | 'highlighted' | 'combo';

export interface PromotionPlan {
  id: PromotionPlanId;
  title: string;
  description: string;
  priceCzk: number;
  durationDays: number;
  isPopular?: boolean;
  stripeEnvKey: string;
  apply: {
    is_top: boolean;
    is_highlighted: boolean;
  };
}

export const promotionPlans: PromotionPlan[] = [
  {
    id: 'top',
    title: 'TOP inzerát',
    description:
      'TOP inzeráty jsou zobrazeny na předních pozicích ve výpisu nabídek a jsou označeny štítkem TOP.',
    priceCzk: 199,
    durationDays: 7,
    stripeEnvKey: 'STRIPE_TOP_PRICE_ID',
    apply: {
      is_top: true,
      is_highlighted: false,
    },
  },
  {
    id: 'highlighted',
    title: 'Zvýrazněný inzerát',
    description:
      'Zvýrazněné inzeráty jsou ve výpisu vizuálně odlišeny a díky tomu jsou pro návštěvníky lépe viditelné.',
    priceCzk: 59,
    durationDays: 7,
    stripeEnvKey: 'STRIPE_HIGHLIGHTED_PRICE_ID',
    apply: {
      is_top: false,
      is_highlighted: true,
    },
  },
  {
    id: 'combo',
    title: 'TOP + zvýraznění',
    description:
      'Kombinace obou služeb pro maximální viditelnost nabídky. Zahrnuje prémiovou pozici i vizuální odlišení.',
    priceCzk: 299,
    durationDays: 7,
    isPopular: true,
    stripeEnvKey: 'STRIPE_COMBO_PRICE_ID',
    apply: {
      is_top: true,
      is_highlighted: true,
    },
  },
];

export function getPromotionPlan(planId: string | null | undefined) {
  return promotionPlans.find((plan) => plan.id === planId) || null;
}
