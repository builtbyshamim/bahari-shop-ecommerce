import React from "react";
import {
  Star,
  Store,
  Shield,
  Clock,
  MapPin,
  Package,
  MessageCircle,
  Users,
} from "lucide-react";
import Image from "next/image";

const VendorInfo = ({ vendor, productCount, rating }: any) => {
  if (!vendor) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Vendor Logo and Basic Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary-100 flex-shrink-0">
          <Image
            width={400}
            height={400}
            src={vendor.logo}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-black-800">{vendor.name}</h3>
            {vendor.verified && (
              <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Shield size={12} />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-primary-500 fill-primary-500" />
              <span className="text-sm font-medium text-black-700">
                {vendor.rating}
              </span>
              <span className="text-xs text-black-400">
                ({vendor.totalReviews})
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-black-500">
              <Package size={14} />
              <span>{productCount} Products</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-black-500">
              <Users size={14} />
              <span>{vendor.followers?.toLocaleString()} Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary-500" />
          <span className="text-sm text-black-600">{vendor.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-primary-500" />
          <span className="text-sm text-black-600">{vendor.responseTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <Store size={16} className="text-primary-500" />
          <span className="text-sm text-black-600">
            Since {new Date(vendor.joinedDate).getFullYear()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <Store size={16} />
          Visit Store
        </button>

        <button className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <MessageCircle size={16} />
          Contact
        </button>
      </div>
    </div>
  );
};

export default VendorInfo;
