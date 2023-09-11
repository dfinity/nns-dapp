<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { createEventDispatcher } from "svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import {
    Html,
    WizardModal,
    type WizardSteps,
    type WizardStep,
    KeyValuePair,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import {
    getAccountsByRootCanister,
    invalidAddress,
  } from "$lib/utils/accounts.utils";
  import type { Account } from "$lib/types/account";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import NeuronSelectMaturityDisbursement from "$lib/components/neuron-detail/NeuronSelectMaturityDisbursement.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { maturityPercentageToE8s } from "$lib/utils/sns-neuron.utils";

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

  const dispatcher = createEventDispatcher();

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  let destinationAddress: string | undefined = undefined;
  let percentage = 0;

  let disabled = false;
  $: disabled =
    invalidAddress({
      address: destinationAddress,
      network: undefined,
      rootCanisterId,
    }) || percentage === 0;

  let mainAccount: Account | undefined = undefined;
  $: mainAccount = (
    getAccountsByRootCanister({
      rootCanisterId,
      universesAccounts: $universesAccountsStore,
    }) ?? []
  ).find(({ type }) => type === "main");
  // preselect main account by default
  $: if (isNullish(destinationAddress) && nonNullish(mainAccount)) {
    destinationAddress = mainAccount?.identifier;
  }

  let maturityToDisburse = 0n;
  $: maturityToDisburse = maturityPercentageToE8s({
    total: Number(formattedMaturity),
    percentage,
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

  const disburseNeuronMaturity = () =>
    dispatcher("nnsDisburseMaturity", {
      percentage,
      destinationAddress: destinationAddress,
    });
  const close = () => dispatcher("nnsClose");
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
    <NeuronSelectMaturityDisbursement
      on:nnsClose={close}
      on:nnsSelect={goToConfirm}
      {rootCanisterId}
      {formattedMaturity}
      {tokenSymbol}
      bind:destinationAddress
      bind:percentage
    />
  {:else if currentStep?.name === "ConfirmDisburseMaturity"}
    <NeuronConfirmActionScreen
      on:nnsConfirm={disburseNeuronMaturity}
      on:nnsCancel={modal.back}
      editLabel={$i18n.neuron_detail.disburse_maturity_edit}
    >
      <Html
        text={$i18n.neuron_detail.disburse_maturity_confirmation_description}
      />
      <div class="content">
        <KeyValuePair>
          <span slot="key" class="description"
            >{$i18n.neuron_detail
              .disburse_maturity_confirmation_percentage}</span
          >
          <span class="value" slot="value" data-tid="confirm-percentage"
            >{formatPercentage(percentage / 100, {
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
          <span slot="key" class="description"
            >{$i18n.neuron_detail
              .disburse_maturity_confirmation_destination}</span
          >
          <span data-tid="confirm-destination" class="value" slot="value"
            >{destinationAddress}
          </span>
        </KeyValuePair>
      </div>
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

<style lang="scss">
  .content {
    margin-top: var(--padding-3x);
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
