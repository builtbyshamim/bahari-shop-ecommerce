import ProductDetailPage from "@/features/product-detail/ProductDetailPage";

async function getProduct(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/api/v1/product-views/${slug}`);

  if (!res.ok) {
    throw new Error("Product fetch failed");
  }

  const json = await res.json();
  return json.data;
}
export async function generateMetadata({ params }: any) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product?.seoMeta?.title || product.name,
    description: product?.seoMeta?.description || product.description,
    keywords: product?.seoMeta?.keywords || [],
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images?.[0]?.url],
    },
  };
}

const Page = async ({ params }: any) => {
  const { slug, category } = await params;
  const product = await getProduct(slug);

  if (!product) {
    throw new Error("Product not found");
  }

  return (
    <ProductDetailPage
      productDetails={product}
      slug={slug}
      category={category}
    />
  );
};

export default Page;
