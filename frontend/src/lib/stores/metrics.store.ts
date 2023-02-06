import type { MetricsSync } from "$lib/types/metrics";
import { writable } from "svelte/store";

// A global store to keep track of the metrics to mitigate the hide/display glitch on navigation of the component when used on desktop and always visible
export const metricsStore = writable<MetricsSync | undefined>(undefined);
