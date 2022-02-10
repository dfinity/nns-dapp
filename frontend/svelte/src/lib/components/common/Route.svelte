<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { routePath } from "../../utils/route.utils";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { RouteStore, routeStore } from "../../stores/route.store";
  import { onDestroy } from "svelte";
  import { AppPath, comparePathWithRoutePath } from "../../../routes/routes";

  export let path: AppPath;
  export let component: typeof SvelteComponent;

  let currentPath: string = routePath();

  const unsubscribe: Unsubscriber = routeStore.subscribe(
    ({ path: routePath }: RouteStore) => (currentPath = routePath)
  );

  onDestroy(unsubscribe);
</script>

{#if comparePathWithRoutePath(path, currentPath)}
  <svelte:component this={component} />
{/if}
