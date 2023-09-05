<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { createEventDispatcher } from "svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import {
    Html,
    WizardModal,
    type WizardSteps,
    type WizardStep,
    KeyValuePair,
    InputRange,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import AddressInput from "$lib/components/accounts/AddressInput.svelte";
  import {
    getAccountsByRootCanister,
    invalidAddress,
  } from "$lib/utils/accounts.utils";
  import type { Account } from "$lib/types/account";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { formatMaturity } from "$lib/utils/neuron.utils.js";
  import { numberToE8s } from "$lib/utils/token.utils";

  export let rootCanisterId: Principal;
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

  let selectedDestinationAddress: string | undefined = undefined;
  let percentageToDisburse = 0;

  let maturityToDisburse;
  $: maturityToDisburse = numberToE8s(
    // Use toFixed to avoid Token validation error "Number X has more than 8 decimals"
    Number(
      ((percentageToDisburse / 100) * Number(formattedMaturity)).toFixed(8)
    )
  );

  let disabled = false;
  $: disabled =
    invalidAddress({
      address: selectedDestinationAddress,
      network: undefined,
      rootCanisterId,
    }) || percentageToDisburse === 0;

  const dispatcher = createEventDispatcher();
  const disburseNeuronMaturity = () =>
    dispatcher("nnsDisburseMaturity", {
      percentageToDisburse,
      destinationAddress: selectedDestinationAddress,
    });
  const close = () => dispatcher("nnsClose");

  let mainAccount: Account | undefined = undefined;
  $: mainAccount = (
    getAccountsByRootCanister({
      rootCanisterId,
      universesAccounts: $universesAccountsStore,
    }) ?? []
  ).find(({ type }) => type === "main");
  // preselect main account by default
  $: if (isNullish(selectedDestinationAddress) && nonNullish(mainAccount)) {
    selectedDestinationAddress = mainAccount?.identifier;
  }

  const goToConfirm = () => modal.next();
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
    <form on:submit|preventDefault={goToConfirm}>
      <div class="available-maturity">
        <KeyValuePair>
          <span slot="key" class="label"
            >{$i18n.neuron_detail.available_maturity}</span
          >
          <span class="value" slot="value">{formattedMaturity}</span>
        </KeyValuePair>
      </div>

      <p class="description">
        <Html
          text={replacePlaceholders(
            $i18n.neuron_detail.disburse_maturity_modal_description,
            { $symbol: tokenSymbol }
          )}
        />
      </p>

      <p class="description">
        {$i18n.neuron_detail.disburse_maturity_modal_destination}
      </p>
      <AddressInput
        qrCode={false}
        bind:address={selectedDestinationAddress}
        {rootCanisterId}
      />

      <div class="select-container">
        <p class="description">
          {$i18n.neuron_detail.disburse_maturity_modal_amount}
        </p>
        <InputRange
          ariaLabel={$i18n.neuron_detail.maturity_range}
          min={0}
          max={100}
          bind:value={percentageToDisburse}
        />
        <h5>
          <span class="description"
            >~{formatMaturity(maturityToDisburse)}
            {$i18n.neuron_detail.maturity}</span
          >
          {formatPercentage(percentageToDisburse / 100, {
            minFraction: 0,
            maxFraction: 0,
          })}
        </h5>
      </div>

      <div class="toolbar">
        <button class="secondary" on:click={close}>{$i18n.core.cancel}</button>
        <button
          data-tid="select-maturity-percentage-button"
          class="primary"
          on:click={goToConfirm}
          {disabled}
        >
          {$i18n.neuron_detail.disburse}
        </button>
      </div>
    </form>
  {:else if currentStep?.name === "ConfirmDisburseMaturity"}
    <NeuronConfirmActionScreen
      on:nnsConfirm={disburseNeuronMaturity}
      on:nnsCancel={modal.back}
    >
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_confirmation_description,
          {
            $percentage: formatPercentage(percentageToDisburse / 100, {
              minFraction: 0,
              maxFraction: 0,
            }),
          }
        )}
      />
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

<style lang="scss">
  .select-container {
    width: 100%;

    h5 {
      margin-top: var(--padding);
      text-align: right;
    }
  }
</style>
