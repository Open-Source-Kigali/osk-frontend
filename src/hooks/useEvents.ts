import { useEffect, useState } from "react";
import type { OSKEvent } from "@/types";
import { fetchEvents } from "@/api";
import { EVENTS } from "@/constants";

interface UseEventsReturn {
  events: OSKEvent[];
  loading: boolean;
  error: string | null;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents]   = useState<OSKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents(EVENTS);
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loading, error };
}
