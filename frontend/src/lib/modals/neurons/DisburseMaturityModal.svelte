<script lang="ts">
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import QrWizardModal from "$lib/modals/transaction/QrWizardModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { QrResponse } from "$lib/types/qr-wizard-modal";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import {
    getAccountByRootCanister,
    invalidAddress,
  } from "$lib/utils/accounts.utils";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import {
    Html,
    KeyValuePair,
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { assertNonNullish, type Token } from "@dfinity/utils";

  type Props = {
    availableMaturityE8s: bigint;
    rootCanisterId: Principal;
    token: Token;
    minimumAmountE8s: bigint;
    selectedNetwork?: TransactionNetwork;
    close: () => void;
    disburseMaturity: (args: {
      percentageToDisburse: number;
      destinationAddress: string | undefined;
    }) => void;
  };

  const {
    availableMaturityE8s,
    rootCanisterId,
    token,
    minimumAmountE8s,
    // Using `undefined` allows only ICRC
    selectedNetwork,
    close,
    disburseMaturity,
  }: Props = $props();

  // export let selectedNetwork: TransactionNetwork | undefined = undefined;

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

  let currentStep: WizardStep | undefined = $state();
  let modal: WizardModal | undefined = $state();
  let percentageToDisburse = $state(0);
  let selectedDestinationAddress: string | undefined = $state();
  // By default, show the dropdown in SelectDestinationAddress
  let showManualAddress = $state(false);
  let scanQrCode:
    | undefined
    | (({ requiredToken }: { requiredToken: Token }) => Promise<QrResponse>) =
    $state();

  const selectedMaturityE8s = $derived(
    (availableMaturityE8s * BigInt(percentageToDisburse)) / 100n
  );
  const notEnoughMaturitySelected = $derived(
    selectedMaturityE8s < minimumAmountE8s
  );
  const disabled = $derived(
    invalidAddress({
      address: selectedDestinationAddress,
      network: undefined,
      rootCanisterId,
    }) || notEnoughMaturitySelected
  );
  // Show the text only if the selected percentage is greater than 0.
  const disabledText = $derived(
    notEnoughMaturitySelected && percentageToDisburse > 0
      ? replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_disabled_tooltip_non_zero,
          { $amount: formatTokenE8s({ value: minimumAmountE8s }) }
        )
      : undefined
  );
  const disburseNeuronMaturity = () => {
    disburseMaturity({
      percentageToDisburse,
      destinationAddress: selectedDestinationAddress,
    });
  };

  const goToConfirm = () => modal?.next();
  const maturityToDisburseE8s = $derived(
    (availableMaturityE8s * BigInt(percentageToDisburse)) / 100n
  );

  // +/- 5%
  const predictedMinimumTokens = $derived(
    formatTokenE8s({
      value: BigInt(Math.floor(Number(maturityToDisburseE8s) * 0.95)),
      roundingMode: "floor",
    })
  );
  const predictedMaximumTokens = $derived(
    formatTokenE8s({
      value: BigInt(Math.ceil(Number(maturityToDisburseE8s) * 1.05)),
      roundingMode: "ceil",
    })
  );

  const goQRCode = async () => {
    if (!scanQrCode) return;

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

  // Note: This doesn't support sub-account names. Yet, we don't have sub-accounts for SNS, nor are we planning to add in the near future.
  const destinationAddressName = $derived(
    getAccountByRootCanister({
      identifier: selectedDestinationAddress,
      rootCanisterId,
      universesAccounts: $universesAccountsStore,
    })?.type === "main"
      ? $i18n.accounts.main
      : selectedDestinationAddress
  );
</script>

<QrWizardModal
  testId="disburse-maturity-modal-component"
  {steps}
  bind:currentStep
  on:nnsClose={close}
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
      {disabled}
      {disabledText}
    >
      <div class="percentage-container" slot="description">
        <span class="description">
          {replacePlaceholders(
            $i18n.neuron_detail.disburse_maturity_description_1,
            { $symbol: token.symbol }
          )}
        </span>

        <span class="description">
          <Html
            text={replacePlaceholders(
              $i18n.neuron_detail.disburse_maturity_description_2,
              { $symbol: token.symbol }
            )}
          />
        </span>

        <SelectDestinationAddress
          {rootCanisterId}
          bind:selectedDestinationAddress
          bind:showManualAddress
          {selectedNetwork}
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
      on:nnsCancel={() => modal?.back()}
      editLabel={$i18n.neuron_detail.disburse_maturity_edit}
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
              { $symbol: token.symbol }
            )}</span
          >
          <span data-tid="confirm-tokens" class="value" slot="value"
            >{predictedMinimumTokens}-{predictedMaximumTokens}
            {token.symbol}
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
            >{destinationAddressName}
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
