<script lang="ts">
  import type { ProposalInfo, NeuronId } from "@dfinity/nns";
  import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import { Value } from "@dfinity/gix-components";

  export let proposalInfo: ProposalInfo;

  let modalOpen = false;

  let proposer: NeuronId | undefined;
  $: ({ proposer } = mapProposalInfo(proposalInfo));
</script>

{#if proposer !== undefined}
  <button class="text" on:click|stopPropagation={() => (modalOpen = true)}
    >{$i18n.proposal_detail.proposer_prefix}: <Value>{proposer}</Value></button
  >

  {#if modalOpen}
    <VotingHistoryModal
      neuronId={proposer}
      on:nnsClose={() => (modalOpen = false)}
    />
  {/if}
{/if}

<style lang="scss">
  button {
    padding: 0;
    line-height: var(--line-height-standard);
    margin: 0;
  }
</style>
