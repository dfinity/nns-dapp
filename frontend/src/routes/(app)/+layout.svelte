<script lang="ts">
  import { browser } from "$app/environment";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import Warnings from "$lib/components/warnings/Warnings.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { analytics } from "$lib/services/analytics.services";
  import {
    initAppAuth,
    initAppPublicData,
  } from "$lib/services/public/app.services";
  import { authStore } from "$lib/stores/auth.store";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { transformUrlForAnalytics } from "$lib/utils/analytics.utils";
  import { confirmCloseApp } from "$lib/utils/before-unload.utils";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import { BusyScreen, Toasts } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import type { AfterNavigate } from "@sveltejs/kit";

  $: confirmCloseApp(
    voteRegistrationActive(
      $voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []
    )
  );

  // Use the top level layout to set the `referrerPath` because anything under `{#if isNullish($navigating)}` will miss the `afterNavigate` events
  afterNavigate(async (nav: AfterNavigate) => {
    // TODO: e2e to test this
    if (!browser) return;

    await Promise.all([initAppAuth(), initAppPublicData()]);

    analytics.pageView();

    const path = referrerPathForNav(nav);
    // Track pageview with comprehensive query parameter tracking
    if (browser && nav.to) {
      const cleanUrl = transformUrlForAnalytics(
        nav.to.url,
        $projectSlugMapStore
      );
      analytics.pageView(cleanUrl);
    }
    if (isNullish(path)) return;

    referrerPathStore.pushPath(path);
  });

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

<Warnings testEnvironmentWarning />

<Toasts />
<BusyScreen />
