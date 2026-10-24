import imageLoader from "./loader";
import {
  DEVICE_SIZES,
  IMAGE_SIZES,
  VARIANT_WIDTHS,
  isOptimizable,
  variantPath,
} from "./variants.mts";

describe("image variants", () => {
  it("points to the WebP variant for the requested width", () => {
    expect(variantPath("/images/posts/demo/diagram.png", 640)).toBe(
      "/_img/images/posts/demo/diagram/640.webp",
    );
    expect(variantPath("/profile-image.jpg", 96)).toBe("/_img/profile-image/96.webp");
    expect(variantPath("/images/posts/linux-fundamentals/root.jpeg", 1920)).toBe(
      "/_img/images/posts/linux-fundamentals/root/1920.webp",
    );
  });

  it("rounds up and caps at the largest generated width", () => {
    expect(variantPath("/a.png", 700)).toBe("/_img/a/960.webp");
    expect(variantPath("/a.png", 5000)).toBe("/_img/a/1920.webp");
  });

  it("ignores SVG, external URLs, directory traversal and the variants themselves", () => {
    for (const src of [
      "/icon.svg",
      "https://example.com/a.png",
      "//example.com/a.png",
      "/images/../../etc/a.png",
      "/_img/a/640.webp",
      "/_img/a.png",
      "images/a.png",
    ]) {
      expect(isOptimizable(src)).toBe(false);
    }
  });

  it("the loader returns the original URL when there is no variant", () => {
    expect(imageLoader({ src: "https://example.com/a.png", width: 640 })).toBe(
      "https://example.com/a.png",
    );
    expect(imageLoader({ src: "/images/posts/demo/diagram.png", width: 640 })).toBe(
      "/_img/images/posts/demo/diagram/640.webp",
    );
  });

  it("widths are sorted; imageSizes are below the smallest deviceSize (a Next requirement)", () => {
    expect([...VARIANT_WIDTHS].sort((a, b) => a - b)).toEqual(VARIANT_WIDTHS);
    expect(Math.max(...IMAGE_SIZES)).toBeLessThan(Math.min(...DEVICE_SIZES));
  });
});
