const FALLBACK_IMAGE =
  "https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg";
import Image from "next/image";
import Link from "next/link";

const TopRankingProductCard = ({ product }: any) => {
  const { name, category, thumbnail, rating = 4 } = product;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <Image
          width={250}
          height={180}
          src={thumbnail?.url || FALLBACK_IMAGE}
          alt={thumbnail?.altText || name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-2 flex flex-col flex-1">
        {/* Category — always takes space */}
        <div className="text-xs text-primary-400 text-center font-medium tracking-wider uppercase min-h-4">
          {category?.name ?? "uncategorized"}
        </div>

        {/* Title — fixed height */}
        <Link href={`/product-details/${category?.slug}/${product.slug}`} className="text-xs  min-h-8 font-medium text-center line-clamp-2 leading-snug mt-1">
          {name}
        </Link>

        {/* Rating — always takes space */}
        <div className="flex items-center justify-center gap-1  min-h-5">
          {rating > 0 ? (
            <>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${
                      i < Math.floor(rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">({10})</span>
            </>
          ) : (
            <span className="text-xs text-transparent select-none">★</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopRankingProductCard;
