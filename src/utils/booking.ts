import { PROMO_CODES } from '../data/constants';
import { PricingBreakdown, TravelPackage, Traveler } from '../types/travel';

export function calculateBookingPricing(
  pkg: TravelPackage,
  optionId: string,
  adults: number,
  children: number,
  infants: number,
  promoCodeInput: string
): PricingBreakdown {
  const selectedOption = pkg.packageOptions.find((o) => o.id === optionId) || pkg.packageOptions[0];
  const optionDelta = selectedOption ? selectedOption.priceDelta : 0;

  const unitBasePrice = pkg.price + optionDelta;
  const unitEffectivePrice = (pkg.discountPrice ?? pkg.price) + optionDelta;

  const adultBase = unitBasePrice;
  const childBase = Math.round(unitBasePrice * pkg.childPriceMultiplier);
  const infantBase = Math.round(unitBasePrice * pkg.infantPriceMultiplier);

  const adultUnitPrice = unitEffectivePrice;
  const childUnitPrice = Math.round(unitEffectivePrice * pkg.childPriceMultiplier);
  const infantUnitPrice = Math.round(unitEffectivePrice * pkg.infantPriceMultiplier);

  const baseSubtotal = adults * adultBase + children * childBase + infants * infantBase;
  const adultsTotal = adults * adultUnitPrice;
  const childrenTotal = children * childUnitPrice;
  const infantsTotal = infants * infantUnitPrice;

  const subtotalAfterPackageDiscount = adultsTotal + childrenTotal + infantsTotal;
  const packageDiscountTotal = Math.max(0, baseSubtotal - subtotalAfterPackageDiscount);

  const normalizedPromo = promoCodeInput.trim().toUpperCase();
  const promoRule = PROMO_CODES[normalizedPromo];
  const promoCodeValid = Boolean(promoRule && subtotalAfterPackageDiscount >= promoRule.minSpend);
  const promoDiscount = promoCodeValid ? promoRule.amount : 0;

  const serviceFee = subtotalAfterPackageDiscount > 0 ? 50000 : 0;
  const totalAmount = Math.max(0, subtotalAfterPackageDiscount - promoDiscount + serviceFee);
  const totalTravelers = adults + children + infants;

  return {
    optionDelta,
    adultUnitPrice,
    childUnitPrice,
    infantUnitPrice,
    adultsTotal,
    childrenTotal,
    infantsTotal,
    baseSubtotal,
    packageDiscountTotal,
    subtotalAfterPackageDiscount,
    promoDiscount,
    promoCodeValid,
    promoLabel: promoCodeValid ? promoRule.label : undefined,
    serviceFee,
    totalAmount,
    totalTravelers
  };
}

export function reconcileTravelers(
  existing: Traveler[],
  adults: number,
  children: number,
  infants: number
): Traveler[] {
  const desiredTypes: ('Adult' | 'Child' | 'Infant')[] = [
    ...Array(adults).fill('Adult'),
    ...Array(children).fill('Child'),
    ...Array(infants).fill('Infant')
  ];

  return desiredTypes.map((type, index) => {
    const prev = existing[index];
    if (prev) {
      return {
        ...prev,
        type
      };
    }
    return {
      id: `trav-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      fullName: '',
      dateOfBirth: '',
      gender: '',
      identityNumber: '',
      specialRequirements: ''
    };
  });
}
