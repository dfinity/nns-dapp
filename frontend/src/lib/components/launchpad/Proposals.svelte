<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    openSnsProposalsStore,
    snsProposalsStoreIsLoading,
  } from "$lib/stores/sns.store";
  import SkeletonProposalCard from "$lib/components/ui/SkeletonProposalCard.svelte";
  import NnsProposalCard from "../proposals/NnsProposalCard.svelte";
  import { loadProposalsSnsCF } from "$lib/services/$public/sns.services";
  import { fade } from "svelte/transition";

  let loading = false;
  $: loading = $snsProposalsStoreIsLoading;

  const load = () => {
    if ($snsProposalsStoreIsLoading) {
      loadProposalsSnsCF();
    }
  };

  onMount(load);
</script>

{#if loading}
  <div in:fade class="card-grid">
    <SkeletonProposalCard />
    <SkeletonProposalCard />
  </div>
{:else if $openSnsProposalsStore.length === 0}
  <p in:fade class="no-proposals description">
    {$i18n.sns_launchpad.no_proposals}
  </p>
{:else}
  <ul class="card-grid">
    {#each $openSnsProposalsStore as proposalInfo, index (proposalInfo.id)}
      <NnsProposalCard {proposalInfo} {index} />
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
