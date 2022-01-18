<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { routePath } from "../utils/route.utils";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { RouteStore, routeStore } from "../stores/route.store";
  import { onDestroy } from "svelte";

  export let path: string;
  export let component: typeof SvelteComponent;

  let currentPath: string = routePath();

  const unsubscribe: Unsubscriber = routeStore.subscribe(
    ({ path: routePath }: RouteStore) => (currentPath = routePath)
  );

  onDestroy(unsubscribe);
</script>

{#if path === currentPath}
  <svelte:component this={component} />
{/if}
