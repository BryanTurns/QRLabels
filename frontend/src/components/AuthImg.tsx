import { useEffect, useState } from "react";
import api from "../api";

// Module-level cache so the same image is only fetched once per session
const cache = new Map<string, string>();

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: React.ReactNode;
}

export default function AuthImg({ src, fallback = null, ...props }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(cache.get(src) ?? null);

  useEffect(() => {
    if (cache.has(src)) {
      setBlobUrl(cache.get(src)!);
      return;
    }
    let cancelled = false;
    api.get(src, { responseType: "blob" })
      .then((r) => {
        if (cancelled) return;
        const url = URL.createObjectURL(r.data);
        cache.set(src, url);
        setBlobUrl(url);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src]);

  if (!blobUrl) return <>{fallback}</>;
  return <img src={blobUrl} {...props} />;
}

/** Call this after deleting an image so the next load re-fetches it. */
export function invalidateImage(src: string) {
  const url = cache.get(src);
  if (url) URL.revokeObjectURL(url);
  cache.delete(src);
}
