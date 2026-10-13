/** Substituto de `next/image` para testes. */
export default function Image({
  src,
  alt,
  fill: _fill,
  priority: _priority,
  ...props
}: Record<string, unknown>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={String(src)} alt={String(alt)} {...props} />;
}
