<script lang="ts">
  import { routePath } from "$lib/utils/route.utils";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { routeStore } from "$lib/stores/route.store";
  import type { RouteStore } from "$lib/stores/route.store";
  import { onDestroy } from "svelte";
  import type { AppPath } from "$lib/constants/routes.constants";
  import RouteModule from "./RouteModule.svelte";
  import { isRoutePath } from "$lib/utils/app-path.utils";

  export let path: AppPath;

  let currentPath = routePath();

  const unsubscribe: Unsubscriber = routeStore.subscribe(
    ({ path }: RouteStore) => (currentPath = path)
  );

  onDestroy(unsubscribe);
</script>

{#if isRoutePath({ paths: [path], routePath: currentPath })}
  <RouteModule {path} />
{/if}
