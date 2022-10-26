<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { initWorker } from "$lib/services/worker.services";

  let worker: { syncAuthIdle: (auth: AuthStore) => void } | undefined;

  onMount(async () => (worker = await initWorker()));

  const unsubscribeAuth = authStore.subscribe(
    async (auth: AuthStore) => {
      worker?.syncAuthIdle(auth);

      if (!auth.identity) {
        return;
      }

      const {initApp} = await import("../lib/services/app.services");
      await initApp();
    }
  );

  onDestroy(() => unsubscribeAuth());
</script>

<slot />

<style lang="scss" global>
  @import "../../node_modules/@dfinity/gix-components/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/variables";
</style>
