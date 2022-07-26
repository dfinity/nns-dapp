<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import type { NeuronId } from "@dfinity/nns";
  import VotingHistoryModal from "../../modals/neurons/VotingHistoryModal.svelte";
  import { i18n } from "../../stores/i18n";
  import { mapProposalInfo } from "../../utils/proposals.utils";

  export let proposalInfo: ProposalInfo;

  let modalOpen = false;

  let proposer: NeuronId | undefined;
  $: ({ proposer } = mapProposalInfo(proposalInfo));
</script>

{#if proposer !== undefined}
  <button class="text" on:click|stopPropagation={() => (modalOpen = true)}
    >{$i18n.proposal_detail.proposer_prefix}
    <span class="value">{proposer}</span></button
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
