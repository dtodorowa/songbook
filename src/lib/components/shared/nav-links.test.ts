import { describe, expect, it } from "vitest";
import { categoryHref, isCategoryActive, isNavLinkActive, isTabActive } from "./nav-links";

const url = (path: string) => new URL(path, "http://localhost");

describe("isNavLinkActive", () => {
  it("lights Songs on the bare library only", () => {
    expect(isNavLinkActive("/", url("/"))).toBe(true);
    expect(isNavLinkActive("/", url("/?category=Rock"))).toBe(false);
    expect(isNavLinkActive("/", url("/backup"))).toBe(false);
  });

  it("lights a section on its own pages", () => {
    expect(isNavLinkActive("/songs/new", url("/songs/new"))).toBe(true);
    expect(isNavLinkActive("/backup", url("/backup"))).toBe(true);
  });
});

describe("category links", () => {
  it("round-trip names with spaces and symbols", () => {
    const href = categoryHref("Road trip & co");
    expect(isCategoryActive("Road trip & co", url(href))).toBe(true);
  });
});

describe("isTabActive", () => {
  it("keeps Songs lit on a song page but not on Add", () => {
    expect(isTabActive("/", url("/songs/abc"))).toBe(true);
    expect(isTabActive("/", url("/songs/new"))).toBe(false);
    expect(isTabActive("/songs/new", url("/songs/new"))).toBe(true);
  });
});
