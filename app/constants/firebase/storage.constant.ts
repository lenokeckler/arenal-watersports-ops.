export const STORAGE = {
  PATHS: {
    BUFOST_SERVICES_ICONS: "bufost-services-icons/",
    BUFOST_PLANS_ICONS: "bufost-plans-icons/",
    HEADQUARTERS_IMAGES: "headquarters-image/",
  },
  REGEX: {
    BUFOST_SERVICES_ICONS_MATCHER:
      /bufost-services-icons\/[^?]+/,
    BUFOST_PLANS_ICONS_MATCHER: /bufost-plans-icons\/[^?]+/,
    HEADQUARTERS_IMAGES_MATCHER:
      /headquarters-image\/[^?]+/,
  },
} as const;

export default STORAGE;
