import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Leonardo Saads — DevSecOps, Observabilidade e Telecom";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "DevSecOps · Observabilidade · Telecom",
    title: "Infraestrutura que você lê, executa e entende.",
  });
}
