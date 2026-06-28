export const simplePricePreview = ({
  price,
  comparePrice,
}: {
  price: number;
  comparePrice?: number;
}) => {
  const discountedPrice = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null;
  return discountedPrice;
};
