<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { initWorker } from "$lib/services/worker.services";
  import {initAppProxy, p_initAppProxy} from "$lib/proxy/app.services.proxy";

  let ready = false;

  let worker: { syncAuthIdle: (auth: AuthStore) => void } | undefined;

  const syncAuth = async (auth: AuthStore) => {
    worker?.syncAuthIdle(auth);

    if (!auth.identity) {
      ready = false;
      return;
    }

    // syncAuth is triggered each time the auth changes but also when the worker is initialized to avoid race condition.
    // As the function can be called twice with a valid identity, we use a flag to only init the data once.
    if (ready) {
      return;
    }

    ready = true;

    // Load app global stores data
    await initAppProxy();
  };

  const onMountWorker = async () => {
      worker = await initWorker();
      await syncAuth($authStore);
  }

  onMount(async () => await Promise.all([p_initAppProxy(), onMountWorker()]));

  const unsubscribeAuth = authStore.subscribe(syncAuth);

  onDestroy(() => unsubscribeAuth());
</script>

<slot />

<style lang="scss" global>
  @import "../../node_modules/@dfinity/gix-components/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/variables";
</style>
