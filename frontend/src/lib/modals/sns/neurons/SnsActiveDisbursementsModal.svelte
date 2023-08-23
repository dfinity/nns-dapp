<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import SnsActiveDisbursementEntry from "$lib/modals/sns/neurons/SnsActiveDisbursementEntry.svelte";

  export let neuron: SnsNeuron;
</script>

<Modal on:nnsClose testId="rename-canister-modal-component">
  <svelte:fragment slot="title"
    >{$i18n.neuron_detail
      .view_active_disbursements_modal_title}</svelte:fragment
  >
  <div class="disbursements">
    {#each neuron.disburse_maturity_in_progress as disbursement}
      <SnsActiveDisbursementEntry {disbursement} />
    {/each}
  </div>
</Modal>

<style lang="scss">
  .disbursements {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
