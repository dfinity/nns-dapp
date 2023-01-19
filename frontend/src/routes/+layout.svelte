<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { initAuthWorker } from "$lib/services/worker-auth.services";
  import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
  import { toastsReset } from "$lib/stores/toasts.store";

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

    // We reset the toast to clear any previous messages.
    // This is notably user-friendly in case of the user would have been sign-out automatically - session duration expired.
    // That way user does not have to manually close previous message.
    toastsReset();

    // Load app global stores data
    await initAppPrivateDataProxy();
  };

  onMount(async () => {
    worker = await initAuthWorker();
    await syncAuth($authStore);
  });

  const unsubscribeAuth = authStore.subscribe(syncAuth);

  onDestroy(() => unsubscribeAuth());
</script>

<slot />

<style lang="scss" global>
  @import "@dfinity/gix-components/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/variables";
</style>
