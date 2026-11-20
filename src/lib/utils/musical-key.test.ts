import { describe, expect, it } from "vitest";
import { MUSICAL_KEYS, shapesWithCapo } from "./musical-key";

describe("MUSICAL_KEYS", () => {
  it("lists 12 majors and 12 minors", () => {
    expect(MUSICAL_KEYS).toHaveLength(24);
    expect(MUSICAL_KEYS).toContain("F#m");
  });
});

describe("shapesWithCapo", () => {
  it("drops the key by the capo's fret", () => {
    expect(shapesWithCapo("A", 2)).toBe("G");
    expect(shapesWithCapo("Bbm", 1)).toBe("Am");
    expect(shapesWithCapo("C", 3)).toBe("A");
  });

  it("reads flats and sharps alike", () => {
    expect(shapesWithCapo("Db", 1)).toBe("C");
    expect(shapesWithCapo("C#", 1)).toBe("C");
  });

  it("is null for a key it can't read", () => {
    expect(shapesWithCapo("H", 1)).toBeNull();
  });
});
