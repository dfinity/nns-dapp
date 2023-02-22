<script lang="ts">
  import Proposals from "$lib/pages/NnsProposals.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import SnsProposals from "$lib/pages/SnsProposals.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import type { AppPath } from "$lib/constants/routes.constants";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nonNullish } from "@dfinity/utils";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";

  export let referrerPath: AppPath | undefined = undefined;
</script>

<main>
  {#if $ENABLE_SNS_VOTING}
    <SummaryUniverse />
  {/if}
  {#if $isNnsUniverseStore || !$ENABLE_SNS_VOTING}
    <Proposals {referrerPath} />
  {:else if nonNullish($snsProjectSelectedStore) && $ENABLE_SNS_VOTING}
    <SnsProposals />
  {/if}
</main>
