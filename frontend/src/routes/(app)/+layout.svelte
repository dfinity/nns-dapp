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
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { browser } from "$app/environment";

  onMount(async () => await Promise.all([initAppAuth(), initAppPublicData()]));

  $: confirmCloseApp(
    voteRegistrationActive(
      $voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []
    )
  );

  // Use the top level layout to set the `referrerPath` because anything under `{#if isNullish($navigating)}` will miss the `afterNavigate` events
  afterNavigate((nav: Navigation) =>
    // TODO: e2e to test this
    referrerPathStore.set(referrerPathForNav(nav))
  );

  // To improve the UX while the app is loading on mainnet we display a spinner which is attached statically in the index.html files.
  // Once the authentication has been initialized we know most JavaScript resources has been loaded and therefore we can hide the spinner, the loading information.
  $: (() => {
    if (!browser) {
      return;
    }

    // We want to display a spinner until the authentication is loaded. This to avoid a glitch when either the landing page or effective content (sign-in / sign-out) is presented.
    if ($authStore === undefined) {
      return;
    }

    const spinner = document.querySelector("body > #app-spinner");
    spinner?.remove();
  })();
</script>

<!-- We are waiting agent-js / the auth store to be loaded before rendering the pages to avoid visual glitch -->
{#if $authStore.identity !== undefined}
  <slot />
{/if}

<Warnings ckBTCWarnings testEnvironmentWarning />

<Toasts />
<BusyScreen />
