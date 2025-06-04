<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatMaturity,
    totalMaturityDisbursementsInProgress,
  } from "$lib/utils/neuron.utils";
  import { Html, KeyValuePair, Modal } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";
  import NnsActiveDisbursementEntry from "./NnsActiveDisbursementEntry.svelte";

  type Props = {
    neuron: NeuronInfo;
    close: () => void;
  };
  const { neuron, close }: Props = $props();

  const activeDisbursementsCount = $derived(
    neuron.fullNeuron?.maturityDisbursementsInProgress?.length ?? 0
  );
  const totalMaturity = $derived(totalMaturityDisbursementsInProgress(neuron));
</script>

<Modal on:nnsClose={close} testId="nns-active-disbursements-modal">
  <svelte:fragment slot="title"
    >{activeDisbursementsCount}
    {$i18n.neuron_detail.view_active_disbursements_modal_title}</svelte:fragment
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
      {#each neuron.fullNeuron?.maturityDisbursementsInProgress ?? [] as disbursement}
        <NnsActiveDisbursementEntry {disbursement} />
      {/each}
    </div>

    <span class="description">
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.active_maturity_disbursements_description,
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
