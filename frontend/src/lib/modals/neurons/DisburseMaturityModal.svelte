<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { createEventDispatcher } from "svelte";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import {
    Html,
    WizardModal,
    type WizardSteps,
    type WizardStep,
    KeyValuePair,
  } from "@dfinity/gix-components";
  import { formatToken, numberToE8s } from "$lib/utils/token.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";

  export let formattedMaturity: string;
  export let tokenSymbol: string;

  const steps: WizardSteps = [
    {
      name: "SelectPercentage",
      title: $i18n.neuron_detail.disburse_maturity_modal_title,
    },
    {
      name: "ConfirmDisburseMaturity",
      title: $i18n.neuron_detail.disburse_maturity_confirmation_modal_title,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  let percentageToDisburse = 0;

  const dispatcher = createEventDispatcher();
  const disburseNeuronMaturity = () =>
    dispatcher("nnsDisburseMaturity", { percentageToDisburse });
  const close = () => dispatcher("nnsClose");

  const goToConfirm = () => modal.next();

  // TODO: Remove and use neuron util introduced in another PR
  const maturityPercentageToE8s = ({
    total,
    percentage,
  }: {
    total: number;
    percentage: number;
  }): bigint =>
    numberToE8s(
      // Use toFixed to avoid Token validation error "Number X has more than 8 decimals"
      // due to `numberToE8s` validation of floating-point approximation issues of IEEE 754 (e.g. 0.1 + 0.2 = 0.30000000000000004)
      Number(((percentage / 100) * total).toFixed(8))
    );

  let maturityToDisburse = 0n;
  $: maturityToDisburse = maturityPercentageToE8s({
    total: Number(formattedMaturity),
    percentage: percentageToDisburse,
  });
  // +/- 5%
  let predictedMinimumTokens: string;
  $: predictedMinimumTokens = formatToken({
    value: BigInt(Number(maturityToDisburse) * 0.95),
  });
  let predictedMaximumTokens: string;
  $: predictedMaximumTokens = formatToken({
    value: BigInt(Number(maturityToDisburse) * 1.05),
  });
</script>

<WizardModal
  testId="disburse-maturity-modal-component"
  {steps}
  bind:currentStep
  on:nnsClose
  bind:this={modal}
>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? steps[0].title}</svelte:fragment
  >

  {#if currentStep?.name === "SelectPercentage"}
    <NeuronSelectPercentage
      {formattedMaturity}
      buttonText={$i18n.neuron_detail.disburse}
      on:nnsSelectPercentage={goToConfirm}
      on:nnsCancel={close}
      bind:percentage={percentageToDisburse}
      disabled={percentageToDisburse === 0}
    >
      <div class="percentage-container" slot="description">
        <span class="description">
          <Html
            text={replacePlaceholders(
              $i18n.neuron_detail.disburse_maturity_description_1,
              { $symbol: tokenSymbol }
            )}
          />
        </span>

        <span class="description">
          <Html
            text={replacePlaceholders(
              $i18n.neuron_detail.disburse_maturity_description_2,
              { $symbol: tokenSymbol }
            )}
          />
        </span>
      </div>

      <svelte:fragment slot="text">
        {$i18n.neuron_detail.disburse_maturity_amount}
      </svelte:fragment>
    </NeuronSelectPercentage>
  {:else if currentStep?.name === "ConfirmDisburseMaturity"}
    <NeuronConfirmActionScreen
      on:nnsConfirm={disburseNeuronMaturity}
      on:nnsCancel={modal.back}
    >
      <Html
        text={$i18n.neuron_detail.disburse_maturity_confirmation_description}
      />
      <div class="confirm-container">
        <KeyValuePair>
          <span slot="key" class="description"
            >{$i18n.neuron_detail
              .disburse_maturity_confirmation_percentage}</span
          >
          <span class="value" slot="value" data-tid="confirm-percentage"
            >{formatPercentage(percentageToDisburse / 100, {
              minFraction: 0,
              maxFraction: 0,
            })}</span
          >
        </KeyValuePair>
        <KeyValuePair>
          <span slot="key" class="description"
            >{$i18n.neuron_detail.disburse_maturity_confirmation_amount}</span
          >
          <span data-tid="confirm-amount" class="value" slot="value"
            >{formatMaturity(maturityToDisburse)}
          </span>
        </KeyValuePair>
        <KeyValuePair>
          <span slot="key" class="description"
            >{replacePlaceholders(
              $i18n.neuron_detail.disburse_maturity_confirmation_tokens,
              { $symbol: tokenSymbol }
            )}</span
          >
          <span data-tid="confirm-tokens" class="value" slot="value"
            >{predictedMinimumTokens}-{predictedMaximumTokens}
            {tokenSymbol}
          </span>
        </KeyValuePair>
        <KeyValuePair>
          <span slot="key" class="description destination-key"
            >{$i18n.neuron_detail
              .disburse_maturity_confirmation_destination}</span
          >
          <span
            data-tid="confirm-destination"
            class="value destination-value"
            slot="value"
            >{$i18n.accounts.main}
          </span>
        </KeyValuePair>
      </div>
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

<style lang="scss">
  .percentage-container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    margin: var(--padding-2x) 0 var(--padding-3x);
  }

  .confirm-container {
    margin-top: var(--padding-3x);
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .destination-key {
    // To not break "To address:" line.
    white-space: nowrap;
  }
</style>
