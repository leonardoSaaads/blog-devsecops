/** Substituto de `next/image` para testes. */
export default function Image({
  src,
  alt,
  fill: _fill,
  preload: _preload,
  ...props
}: Record<string, unknown>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={String(src)} alt={String(alt)} {...props} />;
}
