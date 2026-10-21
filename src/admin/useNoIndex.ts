import { useEffect } from "react";

export function useNoIndex(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      document.title = previousTitle;
      meta.remove();
    };
  }, [title]);
}
