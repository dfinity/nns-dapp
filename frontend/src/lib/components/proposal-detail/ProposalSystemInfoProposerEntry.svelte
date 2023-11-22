<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronId } from "@dfinity/nns";
  import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";

  export let proposer: NeuronId | undefined;

  let modalOpen = false;
  // TODO: For simplicity reason, currently we do not display the proposer details if not signed-in. We might want to improve the display of these information in the future.
</script>

<TestIdWrapper testId="proposal-system-info-proposer-entry-component">
  {#if proposer !== undefined}
    <KeyValuePairInfo testId="proposal-system-info-proposer" alignIconRight>
      <span class="description" slot="key"
        >{$i18n.proposal_detail.proposer_prefix}</span
      >

      <svelte:fragment slot="value">
        <Hash
          id="proposer-id"
          text={`${proposer}`}
          tagName="span"
          showCopy
          splitLength={6}
          tooltipTop
          isClickable={$authSignedInStore}
          on:nnsHash={() => (modalOpen = true)}
        />
      </svelte:fragment>

      <svelte:fragment slot="info">
        <Html text={$i18n.proposal_detail.proposer_description} />
      </svelte:fragment>
    </KeyValuePairInfo>

    {#if modalOpen}
      <VotingHistoryModal
        neuronId={proposer}
        on:nnsClose={() => (modalOpen = false)}
      />
    {/if}
  {/if}
</TestIdWrapper>
