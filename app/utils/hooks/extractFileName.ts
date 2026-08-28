import { Nullable } from "@/app/types";
import { INDEX } from "@/app/constants";

export const extractFileName = (
  url: string
): Nullable<string> => {
  if (!url) {
    return null;
  }

  try {
    const urlWithoutParams = url.split("?")[INDEX.ZERO];

    if (!urlWithoutParams) {
      return null;
    }

    const decodedUrl = decodeURIComponent(urlWithoutParams);
    const pathParts = decodedUrl.split("/");
    const fileName =
      pathParts[pathParts.length - INDEX.FIRST];

    if (!fileName) {
      return null;
    }

    return fileName;
  } catch {
    return null;
  }
};
