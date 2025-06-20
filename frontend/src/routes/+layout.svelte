<script lang="ts">
  import Alfred from "$lib/components/alfred/Alfred.svelte";
  import Highlight from "$lib/components/ui/Highlight.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
  import { initAnalytics } from "$lib/services/analytics.services";
  import {
    initAuthWorker,
    type AuthWorker,
  } from "$lib/services/worker-auth.services";
  import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
  import { ENABLE_DISBURSE_MATURITY } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsClean } from "$lib/stores/toasts.store";
  import { onMount } from "svelte";
  import "../lib/app.css";

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
    initAnalytics();

    worker = await initAuthWorker();
    await syncAuth($authStore);
  });

  $: syncAuth($authStore);
</script>

<Alfred />

{#if $ENABLE_DISBURSE_MATURITY && $authSignedInStore}
  <Highlight
    level="info"
    title={$i18n.highlight.disburse_maturity_title}
    description={$i18n.highlight.disburse_maturity_description}
    link="https://internetcomputer.org/docs/building-apps/governing-apps/nns/using-the-nns-dapp/nns-dapp-advanced-neuron-operations#maturity-disbursements"
    id="disburse-maturity-feature"
  />
{/if}

<slot />

<style lang="scss" global>
  @import "@dfinity/gix-components/dist/styles/global.scss";
  @import "../lib/themes/legacy";
  @import "../lib/themes/global";
  @import "../lib/themes/variables";
</style>
