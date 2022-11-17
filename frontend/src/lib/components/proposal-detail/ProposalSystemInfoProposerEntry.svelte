<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronId } from "@dfinity/nns";
  import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  export let proposer: NeuronId | undefined;

  let modalOpen = false;

  // For simplicity reason, currently we do not display the proposer details if not signed-in
  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if proposer !== undefined}
  <KeyValuePairInfo testId="proposal-system-info-proposer">
    <svelte:fragment slot="key"
      >{$i18n.proposal_detail.proposer_prefix}</svelte:fragment
    >

    <svelte:fragment slot="value">
      {#if signedIn}
        <button
          class="text"
          on:click|stopPropagation={() => (modalOpen = true)}
        >
          <span class="value" data-tid="proposal-system-info-proposer-value"
            >{proposer}</span
          >
        </button>
      {:else}
        <span class="value" data-tid="proposal-system-info-proposer-value">{proposer}</span>
      {/if}
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

<style lang="scss">
  button {
    margin: 0;
    padding: 0;
    font-size: inherit;
  }
</style>
