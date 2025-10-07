<svelte:options accessors />

<script lang="ts">
  import TransactionForm from "$lib/components/transaction/TransactionForm.svelte";
  import TransactionReceivedAmount from "$lib/components/transaction/TransactionReceivedAmount.svelte";
  import TransactionReview from "$lib/components/transaction/TransactionReview.svelte";
  import QrWizardModal from "$lib/modals/transaction/QrWizardModal.svelte";
  import type { Account } from "$lib/types/account";
  import type { QrResponse } from "$lib/types/qr-wizard-modal";
  import type {
    TransactionInit,
    TransactionNetwork,
    TransactionSelectDestinationMethods,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import type {
    WizardModal,
    WizardStep,
    WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import {
    ICPToken,
    TokenAmount,
    TokenAmountV2,
    isNullish,
    nonNullish,
    type Token,
  } from "@dfinity/utils";

  export let testId = "transaction-modal-component";
  export let transactionInit: TransactionInit = {};

  // User inputs initialized with given initial parameters when component is mounted. If initial parameters vary, we do not want to overwrite what the user would have already entered.
  let sourceAccount: Account | undefined = transactionInit.sourceAccount;
  let destinationAddress: string | undefined =
    transactionInit.destinationAddress;
  let selectDestinationMethods: TransactionSelectDestinationMethods =
    transactionInit.selectDestinationMethods ?? "all";
  let networkReadonly = transactionInit.networkReadonly;
  let showLedgerFee = transactionInit.showLedgerFee ?? true;

  // User inputs exposed for bind in consumers and initialized with initial parameters when component is mounted.
  export let amount: number | undefined = transactionInit.amount;

  // User inputs exposed for bind in consumers
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  export let rootCanisterId: Principal;
  export let currentStep: WizardStep | undefined = undefined;
  export let token: Token = ICPToken;
  export let transactionFee: TokenAmount | TokenAmountV2;
  export let disableContinue = false;
  export let disableSubmit = false;
  // Max amount accepted by the transaction without fees
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let validateAmount: ValidateAmountFn = () => undefined;
  // TODO: Add transaction fee as a Token parameter https://dfinity.atlassian.net/browse/L2-990

  // Optional transaction memo to include in the submission payload
  export let withMemo: boolean = false;

  // Init configuration only once when component is mounting. The configuration should not vary when user interact with the form.
  let canSelectDestination = isNullish(transactionInit.destinationAddress);
  let canSelectSource = isNullish(transactionInit.sourceAccount);
  let mustSelectNetwork = transactionInit.mustSelectNetwork ?? false;
  let memo: string | undefined = undefined;

  let selectedDestinationAddress: string | undefined = destinationAddress;

  let showManualAddress = selectDestinationMethods !== "dropdown";

  // Wizard modal steps and navigation
  const STEP_FORM = "Form";
  const STEP_PROGRESS = "Progress";

  const steps: WizardSteps = [
    {
      name: STEP_FORM,
      title: "",
    },
    {
      name: "Review",
      title: "",
    },
    {
      name: STEP_PROGRESS,
      title: "",
    },
  ];

  let modal: WizardModal<string>;
  let scanQrCode: ({
    requiredToken,
  }: {
    requiredToken: Token;
  }) => Promise<QrResponse>;

  const goNext = () => {
    modal.next();
  };
  const goBack = () => {
    modal.back();
  };

  const goStep = (step: string) =>
    modal.set(steps.findIndex(({ name }) => name === step));

  export const goProgress = () => goStep(STEP_PROGRESS);

  const goQRCode = async () => {
    const {
      result,
      identifier,
      amount: paymentAmount,
    } = await scanQrCode({
      requiredToken: token,
    });

    if (result !== "success") {
      return;
    }

    selectedDestinationAddress = identifier;

    if (nonNullish(paymentAmount)) {
      amount = paymentAmount;
    }
  };
</script>

<QrWizardModal
  {testId}
  {steps}
  bind:currentStep
  bind:modal
  bind:scanQrCode
  on:nnsClose
  disablePointerEvents={currentStep?.name === STEP_PROGRESS}
>
  <slot name="title" slot="title" />
  {#if currentStep?.name === "Form"}
    <TransactionForm
      {rootCanisterId}
      {canSelectDestination}
      {canSelectSource}
      {disableContinue}
      {transactionFee}
      {validateAmount}
      bind:selectedDestinationAddress
      bind:selectedAccount={sourceAccount}
      bind:amount
      bind:showManualAddress
      bind:selectDestinationMethods
      bind:memo
      {skipHardwareWallets}
      {maxAmount}
      {token}
      on:nnsNext={goNext}
      on:nnsClose
      {mustSelectNetwork}
      bind:selectedNetwork
      {networkReadonly}
      {showLedgerFee}
      on:nnsOpenQRCodeReader={goQRCode}
      {withMemo}
    >
      <slot name="additional-info-form" slot="additional-info" destination />
    </TransactionForm>
  {/if}
  {#if currentStep?.name === "Review" && nonNullish(sourceAccount) && nonNullish(amount) && nonNullish(selectedDestinationAddress)}
    <TransactionReview
      transaction={{
        destinationAddress: selectedDestinationAddress,
        sourceAccount,
        amount,
        memo,
      }}
      handleGoBack={goBack}
      {transactionFee}
      {disableSubmit}
      {token}
      {selectedNetwork}
      {showLedgerFee}
      on:nnsSubmit
      on:nnsClose
      {withMemo}
      {memo}
    >
      {#snippet additionalInfo()}
        <slot name="additional-info-review" />
      {/snippet}
      {#snippet destinationInfo()}
        <slot name="destination-info" />
      {/snippet}
      {#snippet description()}
        <slot name="description" />
      {/snippet}
      {#snippet receivedAmount()}
        <slot name="received-amount">
          <TransactionReceivedAmount amount={amount!} {token} />
        </slot>
      {/snippet}
    </TransactionReview>
  {/if}
  {#if currentStep?.name === STEP_PROGRESS}
    <slot name="in_progress" />
  {/if}
</QrWizardModal>
