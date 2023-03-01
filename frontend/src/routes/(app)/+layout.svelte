<script lang="ts">
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { syncBeforeUnload } from "$lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import { onDestroy, onMount } from "svelte";
  import { Toasts, BusyScreen } from "@dfinity/gix-components";
  import {
    initAppAuth,
    initAppPublicData,
  } from "$lib/services/$public/app.services";
  import Metrics from "$lib/components/metrics/Metrics.svelte";
  import Warnings from "$lib/components/metrics/Warnings.svelte";
  import { ENABLE_METRICS } from "$lib/constants/environment.constants";

  onMount(async () => await Promise.all([initAppAuth(), initAppPublicData()]));

  const unsubscribeVoteInProgress = voteRegistrationStore.subscribe(
    ({ registrations }) =>
      syncBeforeUnload(voteRegistrationActive(registrations))
  );

  onDestroy(() => unsubscribeVoteInProgress());
</script>

<slot />

{#if ENABLE_METRICS}
  <Metrics />
{/if}

<Warnings />

<Toasts />
<BusyScreen />
