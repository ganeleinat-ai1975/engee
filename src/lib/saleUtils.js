export function applyDiscount(price, type, value) {
  if (!price || !value) return price;
  if (type === 'percentage') return Math.round(price * (1 - value / 100));
  if (type === 'fixed') return Math.max(0, price - value);
  return price;
}

export function getSalePrice(product, activeSale) {
  if (!activeSale || !activeSale.is_active || !product?.price) return null;

  const now = new Date();
  if (activeSale.start_date && new Date(activeSale.start_date) > now) return null;
  if (activeSale.end_date) {
    const endDate = new Date(activeSale.end_date);
    endDate.setHours(23, 59, 59, 999);
    if (endDate < now) return null;
  }

  const isSpecific = activeSale.product_ids?.includes(product.id);

  let salePrice = null;

  if (activeSale.scope === 'all') {
    salePrice = applyDiscount(product.price, activeSale.discount_type, activeSale.discount_value);
  } else if (activeSale.scope === 'specific') {
    if (!isSpecific) return null;
    salePrice = applyDiscount(product.price, activeSale.discount_type, activeSale.discount_value);
  } else if (activeSale.scope === 'all_plus_specific') {
    salePrice = applyDiscount(product.price, activeSale.discount_type, activeSale.discount_value);
    if (isSpecific && activeSale.extra_discount_value > 0) {
      salePrice = applyDiscount(salePrice, activeSale.extra_discount_type, activeSale.extra_discount_value);
    }
  }

  // If sale price equals original price, no point showing as "sale"
  if (salePrice !== null && salePrice >= product.price) return null;

  return salePrice;
}