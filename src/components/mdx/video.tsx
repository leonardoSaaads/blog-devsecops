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
        Your browser does not support HTML5 video. <a href={src}>Download the video</a>.
      </video>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
