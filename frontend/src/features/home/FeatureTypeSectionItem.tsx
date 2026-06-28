import FeatureTypeSlider from './FeatureTypeSlider';
async function fetchProductsByFeatureType(slug: string) {
  console.log(`Fetching products for feature type "${slug}"...`);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/v1/top-rankings/products/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data?.data) ? json.data.data : [];
}
interface Props {
  slug: string;
}

const FeatureTypeSectionItem = async ({ slug }: Props) => {
  let products: any[] = [];
  try {
    products = await fetchProductsByFeatureType(slug);
  } catch {
    return null;
  }

  if (!products.length) return null;

  return <FeatureTypeSlider products={products} />;
};

export default FeatureTypeSectionItem;
