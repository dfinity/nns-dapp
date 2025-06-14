<script lang="ts">
  import { selectedTokenStore } from "$lib/derived/selected-token.derived";
  import SnsActiveDisbursementEntry from "$lib/modals/sns/neurons/SnsActiveDisbursementEntry.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { totalDisbursingMaturity } from "$lib/utils/sns-neuron.utils";
  import { Html, KeyValuePair, Modal } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let neuron: SnsNeuron;

  let token: Token | undefined;
  $: token = $selectedTokenStore;

  let symbol: string;
  $: symbol = token?.symbol ?? "";

  // calculate the total maturity
  let totalMaturity: bigint;
  $: totalMaturity = totalDisbursingMaturity(neuron);

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");
</script>

<Modal on:nnsClose testId="sns-active-disbursements-modal">
  <svelte:fragment slot="title"
    >{$i18n.neuron_detail
      .view_active_disbursements_modal_title}</svelte:fragment
  >

  <div class="content">
    <KeyValuePair>
      <span slot="key" class="label"
        >{$i18n.neuron_detail.view_active_disbursements_total}</span
      >
      <span class="value" slot="value" data-tid="total-maturity"
        >{formatMaturity(totalMaturity)}</span
      >
    </KeyValuePair>

    <div class="disbursements">
      {#each neuron.disburse_maturity_in_progress as disbursement}
        <SnsActiveDisbursementEntry {disbursement} />
      {/each}
    </div>

    <span class="description">
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.active_maturity_disbursements_description_sns,
          {
            $symbol: symbol,
          }
        )}
      />
    </span>
  </div>

  <div class="toolbar">
    <button on:click={close} class="primary">{$i18n.core.close}</button>
  </div>
</Modal>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .disbursements {
    padding: var(--padding), 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
