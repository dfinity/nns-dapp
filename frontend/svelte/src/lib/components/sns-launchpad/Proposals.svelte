<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import CardGrid from "../ui/CardGrid.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import ProposalCard from "./ProposalCard.svelte";

  let loading: boolean = false;
  let proposals: ProposalInfo[] | undefined = undefined;

  const load = async () => {
    loading = true;

    // TODO L2-751: replace the source
    proposals = await listSnsProposals();

    loading = false;
  };

  onMount(load);
</script>

{#if loading}
  <CardGrid>
    <SkeletonCard />
    <SkeletonCard />
  </CardGrid>
{:else if proposals !== undefined}
  {#if proposals.length === 0}
    <p class="no-proposals">{$i18n.voting.nothing_found}</p>
  {:else}
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
