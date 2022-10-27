<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { initWorker } from "$lib/services/worker.services";
  import { pageReferrerStore } from "$lib/stores/page.store";
  import { pathForRouteId } from "$lib/utils/page.utils";
  import { page } from "$app/stores";
  import { initAppProxy } from "$lib/proxy/app.services.proxy";

  let worker: { syncAuthIdle: (auth: AuthStore) => void } | undefined;

  onMount(async () => (worker = await initWorker()));

  const unsubscribeAuth = authStore.subscribe(async (auth: AuthStore) => {
    worker?.syncAuthIdle(auth);

    if (!auth.identity) {
      return;
    }

    await initAppProxy();
  });

  onDestroy(() => unsubscribeAuth());

  $: (() => pageReferrerStore.set(pathForRouteId($page.routeId)))();
</script>

<slot />

<style lang="scss" global>
  @import "../../node_modules/@dfinity/gix-components/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/variables";
</style>
