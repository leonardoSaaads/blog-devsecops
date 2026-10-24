import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-mono text-sm text-accent">HTTP 404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Page not found</h1>
        <pre
          className="mx-auto mt-6 max-w-md rounded-xl bg-code p-4 text-left font-mono text-sm text-muted-foreground"
          aria-hidden="true"
        >
          {`$ curl -I ${"<this-url>"}\nHTTP/2 404\n$ grep -r "what you are looking for" /blog\n# try the search: Ctrl+K`}
        </pre>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 font-semibold"
          >
            <Search className="size-4" aria-hidden="true" /> Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
