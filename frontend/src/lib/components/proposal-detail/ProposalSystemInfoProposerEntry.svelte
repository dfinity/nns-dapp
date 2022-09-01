<script lang="ts">
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import { sanitize } from "../../utils/html.utils";
  import { i18n } from "../../stores/i18n";
  import type { NeuronId } from "@dfinity/nns";
  import VotingHistoryModal from "../../modals/neurons/VotingHistoryModal.svelte";

  export let proposer: NeuronId | undefined;

  let modalOpen = false;
</script>

{#if proposer !== undefined}
  <KeyValuePairInfo>
    <svelte:fragment slot="key"
      >{$i18n.proposal_detail.proposer_prefix}</svelte:fragment
    >

    <button
      class="text"
      on:click|stopPropagation={() => (modalOpen = true)}
      slot="value"
    >
      <span class="value" data-tid="proposal-system-info-proposer-value"
        >{proposer}</span
      >
    </button>

    <p slot="info" data-tid="proposal-system-info-proposer-description" class="description">
      {@html sanitize($i18n.proposal_detail.proposer_description)}
    </p>
  </KeyValuePairInfo>

  {#if modalOpen}
    <VotingHistoryModal
      neuronId={proposer}
      on:nnsClose={() => (modalOpen = false)}
    />
  {/if}
{/if}

<style lang="scss">
  button {
    margin: 0;
    padding: 0;
    font-size: inherit;
  }
</style>
