import React from "react";
import {
  FaFacebookF,
  FaYoutube,
  FaXTwitter,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa6";

export type SocialName =
  | "facebook"
  | "youtube"
  | "x"
  | "tiktok"
  | "instagram";

interface SocialIconProps {
  name: SocialName;
  className?: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({
  name,
  className = "w-4 h-4",
}) => {
  const iconProps = {
    className,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "facebook":
      return <FaFacebookF {...iconProps} />;
    case "youtube":
      return <FaYoutube {...iconProps} />;
    case "x":
      return <FaXTwitter {...iconProps} />;
    case "tiktok":
      return <FaTiktok {...iconProps} />;
    case "instagram":
      return <FaInstagram {...iconProps} />;
    default:
      return null;
  }
};
