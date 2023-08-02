<script lang="ts">
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { confirmCloseApp } from "$lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import { onMount } from "svelte";
  import { Toasts, BusyScreen } from "@dfinity/gix-components";
  import {
    initAppAuth,
    initAppPublicData,
  } from "$lib/services/$public/app.services";
  import Warnings from "$lib/components/warnings/Warnings.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import type { Navigation } from "@sveltejs/kit";
  import { afterNavigate } from "$app/navigation";
  import { referrerPathStore } from "$lib/stores/referrerPath.store";
  import { referrerPathForNav } from "$lib/utils/page.utils";

  onMount(async () => await Promise.all([initAppAuth(), initAppPublicData()]));

  $: confirmCloseApp(
    voteRegistrationActive(
      $voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []
    )
  );

  // Use the top level layout to set the `referrerPath` because anything under `{#if isNullish($navigating)}` will miss the `afterNavigate` events
  afterNavigate((nav: Navigation) =>
    referrerPathStore.set(referrerPathForNav(nav))
  );
</script>

<slot />

<Warnings ckBTCWarnings testEnvironmentWarning />

<Toasts />
<BusyScreen />
