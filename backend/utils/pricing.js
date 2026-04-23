export const PROMO_CODES = {
  '20 DOLLAR OFF': { type: 'fixed', value: 20 },
  WELCOME10: { type: 'percent', value: 0.1 },
  TAKE5: { type: 'percent', value: 0.05 },
};

export const TAX_RATE = 0.1;
export const computeAmounts = (items, discountCode = '') => {
  const subtotal = items.reduce(
    (sum, it) => sum + (it.price || 0) * it.quantity,
    0,
  );
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  let discount = 0;
  const promo = PROMO_CODES[discountCode];
  if (promo) {
    discount =
      promo.type === 'fixed'
        ? Math.min(promo.value, subtotal)
        : +(subtotal * promo.value).toFixed(2);
  }

  const total = +(subtotal + tax - discount).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    tax,
    discount,
    total,
  };
};
