"use client";

import { useEffect, useState } from "react";

const format = (d: Date) => {
  const day = d.toLocaleDateString("en-GB", { weekday: "short" });
  const date = String(d.getDate()).padStart(2, "0");
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${date} · ${time}`;
};

/** Visitor's local day and time. Empty on the server so the prerendered HTML stays static. */
export function LiveClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time suppressHydrationWarning className="tabular-nums">
      {now ?? " "}
    </time>
  );
}
