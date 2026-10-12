import { useEffect, useState } from "react";
import { getMediaDataUrl } from "@/lib/media-store";

export function useResolvedMediaUrl(refOrUrl: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() =>
    refOrUrl && !refOrUrl.startsWith("idb://") ? refOrUrl : undefined,
  );

  useEffect(() => {
    let cancelled = false;
    if (!refOrUrl) {
      setUrl(undefined);
      return;
    }
    if (!refOrUrl.startsWith("idb://")) {
      setUrl(refOrUrl);
      return;
    }
    void getMediaDataUrl(refOrUrl).then((resolved) => {
      if (!cancelled) setUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [refOrUrl]);

  return url;
}

export function MediaImage({
  src,
  alt,
  className = "",
  fallbackText,
  onClick,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  fallbackText?: string;
  onClick?: () => void;
}) {
  const resolved = useResolvedMediaUrl(src);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [resolved]);

  if (!resolved || errored) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center bg-secondary text-xs text-muted-foreground ${className}`}
      >
        {fallbackText ?? alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      onClick={onClick}
      className={className}
    />
  );
}
