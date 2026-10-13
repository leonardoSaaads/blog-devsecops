export function Video({ src, caption, title }: { src: string; caption?: string; title: string }) {
  return (
    <figure className="not-prose my-8">
      <video
        controls
        preload="metadata"
        playsInline
        title={title}
        className="w-full rounded-xl border border-border bg-black"
      >
        <source src={src} type="video/mp4" />
        Seu navegador não suporta vídeo HTML5. <a href={src}>Baixe o vídeo</a>.
      </video>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
