<script lang="ts">
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { onDestroy, onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { AuthStore } from "$lib/stores/auth.store";
  import { Toasts } from "@dfinity/gix-components";
  import BusyScreen from "$lib/components/ui/BusyScreen.svelte";
  import { initWorker } from "$lib/services/worker.services";
  import { initApp } from "$lib/services/app.services";
  import { syncBeforeUnload } from "$lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Spinner } from "@dfinity/gix-components";

  let worker: { syncAuthIdle: (auth: AuthStore) => void } | undefined;

  onMount(async () => (worker = await initWorker()));

  const unsubscribeAuth: Unsubscriber = authStore.subscribe(
    async (auth: AuthStore) => {
      worker?.syncAuthIdle(auth);

      if (!auth.identity) {
        return;
      }

      await initApp();
    }
  );

  const unsubscribeVoteInProgress: Unsubscriber =
    voteRegistrationStore.subscribe(({ registrations }) =>
      syncBeforeUnload(voteRegistrationActive(registrations))
    );

  onDestroy(() => {
    unsubscribeAuth();
    unsubscribeVoteInProgress();
  });

  const syncAuthStore = async () => {
    try {
      await authStore.sync();
    } catch (err) {
      toastsError({ labelKey: "error.auth_sync", err });
    }
  };
</script>

{#await syncAuthStore()}
  <Spinner />
{:then}
  <slot />
{/await}

<Toasts />
<BusyScreen />

<style lang="scss" global>
  @import "../../node_modules/@dfinity/gix-components/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/variables";
</style>
