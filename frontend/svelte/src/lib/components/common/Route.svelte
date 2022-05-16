<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { routePath } from "../../utils/route.utils";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { routeStore } from "../../stores/route.store";
  import type { RouteStore } from "../../stores/route.store";
  import { onDestroy } from "svelte";
  import type { AppPath } from "../../constants/routes.constants";
  import { isRoutePath } from "../../utils/app-path.utils";

  export let path: AppPath;
  export let component: typeof SvelteComponent;

  let currentPath: string = routePath();

  const unsubscribe: Unsubscriber = routeStore.subscribe(
    ({ path }: RouteStore) => (currentPath = path)
  );

  onDestroy(unsubscribe);
</script>

{#if isRoutePath({ path, routePath: currentPath })}
  <svelte:component this={component} />
{/if}
