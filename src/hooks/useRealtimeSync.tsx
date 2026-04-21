import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime changes on the given Postgres tables and calls
 * `onChange` whenever any row changes. Use this to keep public-facing
 * pages in sync with admin updates without a manual refresh.
 */
export function useRealtimeSync(
  tables: string[],
  onChange: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const channel = supabase.channel(`realtime-${tables.join("-")}-${Math.random()}`);

    tables.forEach((table) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => onChange()
      );
    });

    channel.subscribe();

    // Also refetch when window regains focus (covers offline/sleep cases)
    const handleFocus = () => onChange();
    window.addEventListener("focus", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tables.join(",")]);
}
