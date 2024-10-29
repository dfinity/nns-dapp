<script lang="ts">
  import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
  import {
    initAuthWorker,
    type AuthWorker,
  } from "$lib/services/worker-auth.services";
  import type { AuthStoreData } from "$lib/stores/auth.store";
  import { authStore } from "$lib/stores/auth.store";
  import { toastsClean } from "$lib/stores/toasts.store";
  import { onMount } from "svelte";

  let ready = false;

  let worker: AuthWorker | undefined;

  const syncAuth = async (auth: AuthStoreData) => {
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
    toastsClean();

    // Load app global stores data
    await initAppPrivateDataProxy();
  };

  onMount(async () => {
    worker = await initAuthWorker();
    await syncAuth($authStore);
  });

  $: syncAuth($authStore);
</script>

<slot />

<style lang="scss" global>
  @import "@dfinity/gix-components/dist/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/global";
  @import "../lib/themes/variables";
</style>
