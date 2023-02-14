<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "$lib/utils/utils";
  import { browser } from "$app/environment";

  export let referrerPath: AppPath | undefined = undefined;

  // Prevent prerendering issue IntersectionObserver is not defined
  // Note: Another solution would be to lazy load the InfiniteScroll component
  let isBrowser = true;
  $: isBrowser = browser;
</script>

<main>
  {#if ENABLE_SNS_VOTING && isBrowser}
    <SummaryUniverse />
  {/if}
  {#if isBrowser && ($isNnsUniverseStore || !ENABLE_SNS_VOTING)}
    <Proposals {referrerPath} />
  {:else if nonNullish($snsProjectSelectedStore) && ENABLE_SNS_VOTING}
    <SnsProposals />
  {/if}
</main>
