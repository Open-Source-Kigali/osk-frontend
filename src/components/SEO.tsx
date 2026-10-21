import { useEffect } from "react";
import { useLocation } from "react-router";
import { DEFAULT_SEO, formatTitle } from "@/config/seo";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

function updateOrCreateMeta(selector: string, attrName: string, attrValue: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function updateOrCreateLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export const SEO = ({
  title,
  description = DEFAULT_SEO.defaultDescription,
  keywords = DEFAULT_SEO.defaultKeywords,
  image = DEFAULT_SEO.defaultImage,
  url,
  type = "website",
  noindex = false,
}: SEOProps) => {
  const location = useLocation();

  const fullTitle = formatTitle(title);
  const keywordsString = Array.isArray(keywords) ? keywords.join(", ") : keywords;

  // Resolve absolute URLs for social crawlers and canonical links
  const origin = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : DEFAULT_SEO.siteUrl;

  const fullUrl = url
    ? (url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`)
    : `${origin}${location.pathname}${location.search}`;

  const fullImage = image.startsWith("http")
    ? image
    : `${origin}${image.startsWith("/") ? "" : "/"}${image}`;

  // Direct DOM synchronization for client transitions and testing
  useEffect(() => {
    document.title = fullTitle;

    updateOrCreateMeta('meta[name="description"]', "name", "description", description);
    if (keywordsString) {
      updateOrCreateMeta('meta[name="keywords"]', "name", "keywords", keywordsString);
    }
    updateOrCreateMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );

    // Open Graph
    updateOrCreateMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    updateOrCreateMeta('meta[property="og:description"]', "property", "og:description", description);
    updateOrCreateMeta('meta[property="og:url"]', "property", "og:url", fullUrl);
    updateOrCreateMeta('meta[property="og:image"]', "property", "og:image", fullImage);
    updateOrCreateMeta('meta[property="og:type"]', "property", "og:type", type);
    updateOrCreateMeta('meta[property="og:site_name"]', "property", "og:site_name", DEFAULT_SEO.siteName);
    updateOrCreateMeta('meta[property="og:locale"]', "property", "og:locale", "en_US");

    // Twitter Card
    updateOrCreateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    updateOrCreateMeta('meta[name="twitter:site"]', "name", "twitter:site", DEFAULT_SEO.twitterHandle);
    updateOrCreateMeta('meta[name="twitter:creator"]', "name", "twitter:creator", DEFAULT_SEO.twitterHandle);
    updateOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    updateOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    updateOrCreateMeta('meta[name="twitter:image"]', "name", "twitter:image", fullImage);

    // Canonical link
    updateOrCreateLink("canonical", fullUrl);
  }, [fullTitle, description, keywordsString, fullUrl, fullImage, type, noindex]);

  // React 19 native metadata tag hoisting
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywordsString ? <meta name="keywords" content={keywordsString} /> : null}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULT_SEO.twitterHandle} />
      <meta name="twitter:creator" content={DEFAULT_SEO.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </>
  );
};

export default SEO;
