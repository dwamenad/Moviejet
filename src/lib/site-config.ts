function normaliseBaseUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

export function getPublicSiteUrl() {
  return normaliseBaseUrl(process.env.PUBLIC_SITE_URL);
}

export function buildPublicSiteUrl(path = "/") {
  const publicSiteUrl = getPublicSiteUrl();

  if (!publicSiteUrl) {
    return null;
  }

  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${publicSiteUrl}${normalisedPath}`;
}
