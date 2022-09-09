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
  import ProjectProposalCard from "./ProposalCard.svelte";
  import ProposalCard from "../proposals/ProposalCard.svelte";
  import { VOTING_UI } from "../../constants/environment.constants";

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
  <ul class="card-grid">
    {#each $openSnsProposalsStore as proposalInfo (proposalInfo.id)}
      {#if VOTING_UI === "legacy"}
        <ProjectProposalCard {proposalInfo} />
      {:else}
        <ProposalCard {proposalInfo} layout="modern" />
      {/if}
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
