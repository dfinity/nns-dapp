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
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_modal_description,
          { $symbol: tokenSymbol }
        )}
      />

      <AddressInput
        qrCode={false}
        bind:address={selectedDestinationAddress}
        {rootCanisterId}
      />

      <NeuronSelectPercentage
        {formattedMaturity}
        buttonText={$i18n.neuron_detail.disburse}
        on:nnsSelectPercentage={goToConfirm}
        on:nnsCancel={close}
        bind:percentage={percentageToDisburse}
        {disabled}
      >
        <svelte:fragment slot="text" />
      </NeuronSelectPercentage>
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
