<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";

  import { loadSnsProposals } from "../../services/proposals.services";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import ProposalCard from "../proposals/ProposalCard.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";

  let loading: boolean = false;
  let proposals: ProposalInfo[] | undefined = undefined;

  const load = async () => {
    loading = true;

    try {
      proposals = await loadSnsProposals();
    } catch (err) {
      toastsStore.error({
        labelKey: "Loading sns proposals failed",
        err,
      });
    }

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
        <ProposalCard {proposalInfo} />
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
