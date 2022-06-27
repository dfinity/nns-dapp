<script lang="ts">
  import type { NeuronId, ProposalId, ProposalInfo } from "@dfinity/nns";
  import { i18n } from "../../../../lib/stores/i18n";
  import VotingHistoryModal from "../../../modals/neurons/VotingHistoryModal.svelte";
  import { mapProposalInfo } from "../../../utils/proposals.utils";

  export let proposalInfo: ProposalInfo;

  let proposer: NeuronId | undefined;
  let id: ProposalId | undefined;
  let topic: string | undefined;
  let url: string | undefined;

  $: ({ proposer, id, url, topic } = mapProposalInfo(proposalInfo));

  let modalOpen = false;
</script>

<div>
  {#if url}
    <a target="_blank" href={url}>{url}</a>
  {/if}

  {#if proposer !== undefined}
    <button class="text" on:click|stopPropagation={() => (modalOpen = true)}>
      {$i18n.proposal_detail.proposer_prefix}
      {proposer}
    </button>

    {#if modalOpen}
      <VotingHistoryModal
        neuronId={proposer}
        on:nnsClose={() => (modalOpen = false)}
      />
    {/if}
  {/if}

  <p>
    {$i18n.proposal_detail.topic_prefix}
    {topic}
  </p>
  <p>{$i18n.proposal_detail.id_prefix} {id}</p>
</div>

<style lang="scss">
  @use "../../../themes/mixins/media";

  div {
    margin: var(--padding-3x) 0;

    a,
    p,
    button {
      display: block;
      margin: 0 0 var(--padding-0_5x);
      padding: 0;

      font-size: var(--font-size-h5);
      text-align: start;
      color: var(--gray-50);
      overflow-wrap: anywhere;

      @include media.min-width(medium) {
        font-size: var(--font-size-h4);
      }
    }
  }
</style>
