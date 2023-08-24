<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import SnsActiveDisbursementEntry from "$lib/modals/sns/neurons/SnsActiveDisbursementEntry.svelte";
  import { createEventDispatcher } from "svelte";

  export let neuron: SnsNeuron;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");
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

  <div class="toolbar">
    <button on:click={close} class="primary">{$i18n.core.close}</button>
  </div>
</Modal>

<style lang="scss">
  .disbursements {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    padding: var(--padding), 0;
  }
</style>
