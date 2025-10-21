<script lang="ts">
  import NnsActiveDisbursementEntry from "$lib/modals/neurons/NnsActiveDisbursementEntry.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatMaturity,
    totalMaturityDisbursementsInProgress,
  } from "$lib/utils/neuron.utils";
  import { Html, KeyValuePair, Modal } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";
  import { ICPToken } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
    close: () => void;
  };
  const { neuron, close }: Props = $props();

  const activeDisbursements = $derived(
    neuron.fullNeuron?.maturityDisbursementsInProgress ?? []
  );
  const totalMaturity = $derived(totalMaturityDisbursementsInProgress(neuron));
</script>

<Modal onClose={close} testId="nns-active-disbursements-modal">
  {#snippet title()}
    {$i18n.neuron_detail.view_active_disbursements_modal_title}
  {/snippet}

  <div class="content">
    <KeyValuePair>
      {#snippet key()}
        <span class="label"
          >{$i18n.neuron_detail.view_active_disbursements_total}</span
        >{/snippet}
      {#snippet value()}<span class="value" data-tid="total-maturity"
          >{formatMaturity(totalMaturity)}</span
        >{/snippet}
    </KeyValuePair>

    <div class="disbursements">
      {#each activeDisbursements as disbursement}
        <NnsActiveDisbursementEntry {disbursement} />
      {/each}
    </div>

    <span class="description">
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.active_maturity_disbursements_description_nns,
          {
            $symbol: ICPToken.symbol,
          }
        )}
      />
    </span>
  </div>

  <div class="toolbar">
    <button data-tid="close-button" onclick={close} class="primary"
      >{$i18n.core.close}</button
    >
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
