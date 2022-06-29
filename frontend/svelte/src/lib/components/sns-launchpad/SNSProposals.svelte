<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { listSnsProposals } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import SNSProposalCard from "./SNSProposalCard.svelte";

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
  <!-- CardGrid -->
  <div>
    <SkeletonCard />
    <SkeletonCard />
  </div>
{:else if proposals !== undefined}
  {#if proposals.length === 0}
    <p class="no-proposals">{$i18n.voting.nothing_found}</p>
  {:else}
    <!-- CardGrid -->
    <div>
      {#each proposals as proposalInfo (proposalInfo.id)}
        <SNSProposalCard {proposalInfo} />
      {/each}
    </div>
  {/if}
{/if}

<style lang="scss">
  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
