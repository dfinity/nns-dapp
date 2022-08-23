<script lang="ts">
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    openSnsProposalsStore,
    snsProposalsStore,
  } from "../../stores/sns.store";
  import { isNullish } from "../../utils/utils";
  import SkeletonProposalCard from "../ui/SkeletonProposalCard.svelte";
  import ProposalCard from "./ProposalCard.svelte";

  let loading: boolean = false;
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
  <div class="card-grid">
    {#each $openSnsProposalsStore as proposalInfo (proposalInfo.id)}
      <ProposalCard {proposalInfo} />
    {/each}
  </div>
{/if}

<style lang="scss">
  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
