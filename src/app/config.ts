/**
 * @file Contains application configuration settings.
 */
const CONTRIBUTORS_SOURCE = process.env.CONTRIBUTORS_SOURCE;
const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || "organization";
const ORG_WEBSITE = process.env.NEXT_PUBLIC_ORG_WEBSITE || "";
const ORG_LOGO_LIGHT =
  process.env.NEXT_PUBLIC_ORG_LOGO_LIGHT || "/logo-symbol-light.svg";
const ORG_LOGO_DARK =
  process.env.NEXT_PUBLIC_ORG_LOGO_DARK || "/logo-symbol-dark.svg";

export {
  CONTRIBUTORS_SOURCE,
  ORG_NAME,
  ORG_WEBSITE,
  ORG_LOGO_LIGHT,
  ORG_LOGO_DARK,
};
