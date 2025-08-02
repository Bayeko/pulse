import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("fusionne des classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("fusionne des classes conditionnelles", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });

  it("supprime les doublons", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
