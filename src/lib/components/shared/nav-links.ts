/** Songs stays lit on the library itself, but not while a category is picked. */
export function isNavLinkActive(href: string, url: URL): boolean {
  if (href === "/") return url.pathname === "/" && !url.searchParams.has("category");
  return url.pathname === href || url.pathname.startsWith(`${href}/`);
}

/** On a phone the Songs tab also owns every song page, since there is no category list. */
export function isTabActive(href: string, url: URL): boolean {
  if (href !== "/") return isNavLinkActive(href, url);
  return (
    url.pathname === "/" || (url.pathname.startsWith("/songs/") && url.pathname !== "/songs/new")
  );
}

export function categoryHref(name: string): string {
  return `/?category=${encodeURIComponent(name)}`;
}

export function isCategoryActive(name: string, url: URL): boolean {
  return url.pathname === "/" && url.searchParams.get("category") === name;
}
