"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scriptsForPath, type RuntimeScript } from "@/lib/runtime";

let started = false;

function appendScript({ src, module }: RuntimeScript): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement("script");
    element.src = src;
    if (module) element.type = "module";
    element.addEventListener("load", () => resolve());
    element.addEventListener("error", () => reject(new Error(`Could not load ${src}`)));
    document.head.appendChild(element);
  });
}

async function loadRuntime(scripts: readonly RuntimeScript[]): Promise<void> {
  for (const script of scripts) {
    await appendScript(script);
  }
  // The runtime waits for `load` to refresh its scroll measurements. When React hydrated after
  // the browser's own `load`, replay it once so those listeners still run.
  if (document.readyState === "complete") {
    window.dispatchEvent(new Event("load"));
  }
}

/**
 * Starts the template's animation runtime once React has hydrated, so the scripts that split
 * words and add classes never touch markup React has not adopted yet.
 */
export function RuntimeScripts() {
  const pathname = usePathname();

  useEffect(() => {
    if (started) return;
    started = true;
    loadRuntime(scriptsForPath(pathname)).catch((error: unknown) => {
      console.error(error);
    });
  }, [pathname]);

  return null;
}
