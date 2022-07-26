<script lang="ts">
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    openForVotesSnsProposalsStore,
    snsProposalsStore,
  } from "../../stores/projects.store";
  import { isNullish } from "../../utils/utils";
  import CardGrid from "../ui/CardGrid.svelte";
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
  <CardGrid>
    <SkeletonProposalCard />
    <SkeletonProposalCard />
  </CardGrid>
{:else if $openForVotesSnsProposalsStore.length === 0}
  <p class="no-proposals">{$i18n.voting.nothing_found}</p>
{:else}
  <CardGrid>
    {#each $openForVotesSnsProposalsStore as proposalInfo (proposalInfo.id)}
      <ProposalCard {proposalInfo} />
    {/each}
  </CardGrid>
{/if}

<style lang="scss">
  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
