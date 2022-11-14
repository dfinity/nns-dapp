<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { syncBeforeUnload } from "$lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import {onDestroy, onMount} from "svelte";
  import { Toasts, BusyScreen } from "@dfinity/gix-components";
  import {authStore} from "$lib/stores/auth.store";
  import {toastsError} from "$lib/stores/toasts.store";
  import {browser, prerendering} from "$app/environment";
  import {displayAndCleanLogoutMsg} from "$lib/services/auth.services";
  import {layoutAuthReady} from "$lib/stores/layout.store";

  const syncAuthStore = async () => {
    try {
      await authStore.sync();
    } catch (err) {
      toastsError({ labelKey: "error.auth_sync", err });
    }
  };

  onMount(async () => {
    if (prerendering || !browser) {
      return;
    }

    await syncAuthStore();

    displayAndCleanLogoutMsg();

    layoutAuthReady.set(true);
  });

  const unsubscribeVoteInProgress = voteRegistrationStore.subscribe(
    ({ registrations }) =>
      syncBeforeUnload(voteRegistrationActive(registrations))
  );

  onDestroy(() => unsubscribeVoteInProgress());
</script>

<Layout>
  <slot />
</Layout>

<Toasts />
<BusyScreen />
