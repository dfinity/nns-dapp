<script lang="ts">
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "$lib/utils/i18n";
  import {
    openSnsProposalsStore,
    snsProposalsStore,
  } from "$lib/utils/sns.store";
  import { isNullish } from "$lib/utils/utils";
  import SkeletonProposalCard from "../ui/SkeletonProposalCard.svelte";
  import ProposalCard from "../proposals/ProposalCard.svelte";

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
  <p class="no-proposals">{$i18n.voting.nothing_found}</p>
{:else}
  <ul class="card-grid">
    {#each $openSnsProposalsStore as proposalInfo (proposalInfo.id)}
      <ProposalCard {proposalInfo} />
    {/each}
  </ul>
{/if}

<style lang="scss">
  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
