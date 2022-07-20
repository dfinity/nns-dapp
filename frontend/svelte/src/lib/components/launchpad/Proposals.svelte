<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    openForVotesSnsProposalsStore,
    snsProposalsStore,
  } from "../../stores/projects.store";
  import { isProposalOpenForVotes } from "../../utils/proposals.utils";
  import { isNullable } from "../../utils/utils";
  import CardGrid from "../ui/CardGrid.svelte";
  import SkeletonProposalCard from "../ui/SkeletonProposalCard.svelte";
  import ProposalCard from "./ProposalCard.svelte";

  let loading: boolean = false;
  $: isNullable($snsProposalsStore);

  let proposals: ProposalInfo[] | undefined = undefined;
  $: proposals = $openForVotesSnsProposalsStore;

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
{:else if proposals !== undefined}
  {#if proposals.length === 0}
    <p class="no-proposals">{$i18n.voting.nothing_found}</p>
  {:else}
    <!-- TODO L2-751: to remove -->
    <p class="no-proposals">Mock proposals</p>

    <CardGrid>
      {#each proposals as proposalInfo (proposalInfo.id)}
        <ProposalCard {proposalInfo} />
      {/each}
    </CardGrid>
  {/if}
{/if}

<style lang="scss">
  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
