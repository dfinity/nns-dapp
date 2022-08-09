<script lang="ts">
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    openSnsProposalsStore,
    snsProposalsStore,
  } from "../../stores/sns.store";
  import { isNullish } from "../../utils/utils";
  import { CardGrid } from "@dfinity/gix-components";
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
{:else if $openSnsProposalsStore.length === 0}
  <p class="no-proposals">{$i18n.voting.nothing_found}</p>
{:else}
  <CardGrid>
    {#each $openSnsProposalsStore as proposalInfo (proposalInfo.id)}
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
