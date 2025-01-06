/**
 * @file Contains application configuration settings.
 */
const CONTRIBUTORS_SOURCE = process.env.CONTRIBUTORS_SOURCE;
const VIP_CONTRIBUTORS_SOURCE = process.env.VIP_CONTRIBUTORS_SOURCE || "";
const VIP_LABEL = process.env.NEXT_PUBLIC_VIP_LABEL || "VIP";
const VIP_ICON = process.env.NEXT_PUBLIC_VIP_ICON || "Star"; // Uses lucide-react icons.
const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || "organization";
const ORG_WEBSITE = process.env.NEXT_PUBLIC_ORG_WEBSITE || "";
const ORG_LOGO_LIGHT =
  process.env.NEXT_PUBLIC_ORG_LOGO_LIGHT || "/logo-symbol-light.svg";
const ORG_LOGO_DARK =
  process.env.NEXT_PUBLIC_ORG_LOGO_DARK || "/logo-symbol-dark.svg";

export {
  CONTRIBUTORS_SOURCE,
  VIP_CONTRIBUTORS_SOURCE,
  VIP_LABEL,
  VIP_ICON,
  ORG_NAME,
  ORG_WEBSITE,
  ORG_LOGO_LIGHT,
  ORG_LOGO_DARK,
};
