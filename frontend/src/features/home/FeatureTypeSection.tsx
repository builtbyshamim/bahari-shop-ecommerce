import Link from 'next/link';
import FeatureTypeSectionItem from './FeatureTypeSectionItem';
import { RiArrowRightLine } from 'react-icons/ri';
async function fetchActiveFeatureTypes() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/v1/feature-types/active`, {
    next: { revalidate: 10 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data;
}

const FeatureTypeSection = async () => {
  let featureTypes: any[] = [];

  try {
    featureTypes = await fetchActiveFeatureTypes();
  } catch (error) {
    return null;
  }

  if (!featureTypes.length) return null;

  return (
    <div className="container py-5 space-y-8">
      {featureTypes?.map((ft: any) => (
        <div key={ft.id} className="">
          <div className="flex justify-between items-center border-b border-[#D5D5D5] pb-2 mb-3">
            <h2 className="text-base sm:text-xl md:text-2xl text-black-900 font-semibold uppercase tracking-tight">
              {ft.name}
            </h2>
            <Link
              href={`/rankings/${ft.slug}`}
              className=" underline text-primary-600 duration-200 font-semibold flex items-center gap-1 text-xs"
            >
              <span>View all</span>
              <RiArrowRightLine className="text-sm" />
            </Link>
          </div>
          <FeatureTypeSectionItem slug={ft.slug} />
        </div>
      ))}
    </div>
  );
};

export default FeatureTypeSection;
