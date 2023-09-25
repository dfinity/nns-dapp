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
  import { formatToken } from "$lib/utils/token.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import QrWizardModal from "../transaction/QrWizardModal.svelte";
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import type { Principal } from "@dfinity/principal";
  import { assertNonNullish, type Token } from "@dfinity/utils";
  import type { QrResponse } from "$lib/types/qr-wizard-modal";
  import { TransactionNetwork } from "$lib/types/transaction";

  export let availableMaturityE8s: bigint;
  export let tokenSymbol: string;
  export let rootCanisterId: Principal;
  export let token: Token;
  export let minimumAmountE8s: bigint;

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
  let selectedMaturityE8s: bigint;
  $: selectedMaturityE8s =
    (availableMaturityE8s * BigInt(percentageToDisburse)) / 100n;

  let disableDisburse = false;
  $: disableDisburse = selectedMaturityE8s < minimumAmountE8s;

  // Show the text only if the selected percentage is greater than 0.
  let disabledText: string | undefined = undefined;
  $: disabledText =
    disableDisburse && percentageToDisburse > 0
      ? replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_disabled_tooltip_non_zero,
          { $amount: formatToken({ value: minimumAmountE8s }) }
        )
      : undefined;

  const dispatcher = createEventDispatcher();
  const disburseNeuronMaturity = () => {
    dispatcher("nnsDisburseMaturity", {
      percentageToDisburse,
      destinationAddress: selectedDestinationAddress,
    });
  };
  const close = () => dispatcher("nnsClose");

  const goToConfirm = () => modal.next();

  let maturityToDisburseE8s: bigint;
  $: maturityToDisburseE8s =
    (availableMaturityE8s * BigInt(percentageToDisburse)) / 100n;

  // +/- 5%
  let predictedMinimumTokens: string;
  $: predictedMinimumTokens = formatToken({
    value: BigInt(Math.floor(Number(maturityToDisburseE8s) * 0.95)),
    roundingMode: "floor",
  });
  let predictedMaximumTokens: string;
  $: predictedMaximumTokens = formatToken({
    value: BigInt(Math.ceil(Number(maturityToDisburseE8s) * 1.05)),
    roundingMode: "ceil",
  });

  let selectedDestinationAddress: string | undefined = undefined;
  // By default, show the dropdown in SelectDestinationAddress
  let showManualAddress = false;

  let scanQrCode: ({
    requiredToken,
  }: {
    requiredToken: Token;
  }) => Promise<QrResponse>;

  const goQRCode = async () => {
    const { result, identifier } = await scanQrCode({
      requiredToken: token,
    });

    if (result !== "success") {
      return;
    }
    // When result === "success", identifier is always defined.
    assertNonNullish(identifier);

    selectedDestinationAddress = identifier;
  };
</script>

<QrWizardModal
  testId="disburse-maturity-modal-component"
  {steps}
  bind:currentStep
  on:nnsClose
  bind:scanQrCode
  bind:modal
>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? steps[0].title}</svelte:fragment
  >

  {#if currentStep?.name === "SelectPercentage"}
    <NeuronSelectPercentage
      {availableMaturityE8s}
      buttonText={$i18n.neuron_detail.disburse}
      on:nnsSelectPercentage={goToConfirm}
      on:nnsCancel={close}
      bind:percentage={percentageToDisburse}
      disabled={disableDisburse}
      {disabledText}
    >
      <div class="percentage-container" slot="description">
        <span class="description">
          {replacePlaceholders(
            $i18n.neuron_detail.disburse_maturity_description_1,
            { $symbol: tokenSymbol }
          )}
        </span>

        <span class="description">
          <Html
            text={replacePlaceholders(
              $i18n.neuron_detail.disburse_maturity_description_2,
              { $symbol: tokenSymbol }
            )}
          />
        </span>

        <SelectDestinationAddress
          {rootCanisterId}
          bind:selectedDestinationAddress
          bind:showManualAddress
          selectedNetwork={TransactionNetwork.ICP}
          on:nnsOpenQRCodeReader={goQRCode}
        />
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
      {$i18n.neuron_detail.disburse_maturity_confirmation_description}
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
            >{formatMaturity(maturityToDisburseE8s)}
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
</QrWizardModal>

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
