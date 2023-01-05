<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    openSnsProposalsStore,
    snsProposalsStore,
  } from "$lib/stores/sns.store";
  import { isNullish } from "$lib/utils/utils";
  import SkeletonProposalCard from "$lib/components/ui/SkeletonProposalCard.svelte";
  import NnsProposalCard from "../proposals/NnsProposalCard.svelte";
  import { listSnsProposals } from "$lib/services/$public/sns.services";

  let loading = false;
  $: loading = isNullish($snsProposalsStore);

  const load = () => {
    if ($snsProposalsStore === undefined) {
      listSnsProposals();
    }
  };

  onMount(load);
</script>

{#if loading}
  <div class="card-grid">
    <SkeletonProposalCard />
    <SkeletonProposalCard />
  </div>
{:else if $openSnsProposalsStore.length === 0}
  <p class="no-proposals description">{$i18n.sns_launchpad.no_proposals}</p>
{:else}
  <ul class="card-grid">
    {#each $openSnsProposalsStore as proposalInfo (proposalInfo.id)}
      <NnsProposalCard {proposalInfo} />
    {/each}
  </ul>
{/if}

<style lang="scss">
  .no-proposals {
    margin: 0 0 var(--padding-2x);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
