<script lang="ts">
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { syncBeforeUnload } from "$lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import { onMount } from "svelte";
  import { Toasts, BusyScreen } from "@dfinity/gix-components";
  import {
    initAppAuth,
    initAppPublicData,
  } from "$lib/services/$public/app.services";
  import Warnings from "$lib/components/metrics/Warnings.svelte";

  onMount(async () => await Promise.all([initAppAuth(), initAppPublicData()]));

  $: syncBeforeUnload(
    voteRegistrationActive($voteRegistrationStore.registrations)
  );
</script>

<slot />

<Warnings />

<Toasts />
<BusyScreen />
