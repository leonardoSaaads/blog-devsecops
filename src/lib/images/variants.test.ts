import imageLoader from "./loader";
import {
  DEVICE_SIZES,
  IMAGE_SIZES,
  VARIANT_WIDTHS,
  isOptimizable,
  variantPath,
} from "./variants.mts";

describe("variantes de imagem", () => {
  it("aponta para a variante WebP da largura pedida", () => {
    expect(variantPath("/images/k8s/pod.png", 640)).toBe("/_img/images/k8s/pod/640.webp");
    expect(variantPath("/profile-image.jpg", 96)).toBe("/_img/profile-image/96.webp");
    expect(variantPath("/images/zabbix/dvr_intelbras_dashboard.jpeg", 1920)).toBe(
      "/_img/images/zabbix/dvr_intelbras_dashboard/1920.webp",
    );
  });

  it("arredonda para cima e limita à maior largura gerada", () => {
    expect(variantPath("/a.png", 700)).toBe("/_img/a/960.webp");
    expect(variantPath("/a.png", 5000)).toBe("/_img/a/1920.webp");
  });

  it("ignora SVG, URLs externas, travessia de diretório e as próprias variantes", () => {
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

  it("loader devolve a URL original quando não há variante", () => {
    expect(imageLoader({ src: "https://example.com/a.png", width: 640 })).toBe(
      "https://example.com/a.png",
    );
    expect(imageLoader({ src: "/images/k8s/pod.png", width: 640 })).toBe(
      "/_img/images/k8s/pod/640.webp",
    );
  });

  it("larguras ordenadas; imageSizes menores que o menor deviceSize (exigência do Next)", () => {
    expect([...VARIANT_WIDTHS].sort((a, b) => a - b)).toEqual(VARIANT_WIDTHS);
    expect(Math.max(...IMAGE_SIZES)).toBeLessThan(Math.min(...DEVICE_SIZES));
  });
});
