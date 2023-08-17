<script lang="ts">
  import { WizardModal } from "@dfinity/gix-components";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import TransactionForm from "$lib/components/transaction/TransactionForm.svelte";
  import TransactionReview from "$lib/components/transaction/TransactionReview.svelte";
  import { TokenAmount, ICPToken, type Token } from "@dfinity/utils";
  import type { Principal } from "@dfinity/principal";
  import type {
    TransactionInit,
    TransactionNetwork,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import TransactionQRCode from "$lib/components/transaction/TransactionQRCode.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import TransactionReceivedAmount from "$lib/components/transaction/TransactionReceivedAmount.svelte";
  import type { TransactionSelectDestinationMethods } from "$lib/types/transaction";
  import { decodePayment } from "@dfinity/ledger";
  import { toastsError } from "$lib/stores/toasts.store";

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
  export let transactionFee: TokenAmount;
  export let disableContinue = false;
  export let disableSubmit = false;
  // Max amount accepted by the transaction without fees
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let validateAmount: ValidateAmountFn = () => undefined;
  // TODO: Add transaction fee as a Token parameter https://dfinity.atlassian.net/browse/L2-990

  // Init configuration only once when component is mounting. The configuration should not vary when user interact with the form.
  let canSelectDestination = isNullish(transactionInit.destinationAddress);
  let canSelectSource = isNullish(transactionInit.sourceAccount);
  let mustSelectNetwork = transactionInit.mustSelectNetwork ?? false;

  let selectedDestinationAddress: string | undefined = destinationAddress;

  let showManualAddress = selectDestinationMethods !== "dropdown";

  // Wizard modal steps and navigation
  const STEP_FORM = "Form";
  const STEP_PROGRESS = "Progress";
  const STEP_QRCODE = "QRCode";

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
    {
      name: STEP_QRCODE,
      title: "",
    },
  ];

  let modal: WizardModal;

  const goNext = () => {
    modal.next();
  };
  const goBack = () => {
    modal.back();
  };

  const goStep = (step: string) =>
    modal.set(steps.findIndex(({ name }) => name === step));

  export const goProgress = () => goStep(STEP_PROGRESS);
  const goQRCode = () => goStep(STEP_QRCODE);
  const goForm = () => goStep(STEP_FORM);

  const onQRCode = ({ detail: value }: CustomEvent<string>) => {
    const payment = decodePayment(value);

    // if we can successfully decode a payment from the QR code, we can validate that it corresponds to the same token and also set the amount, in addition to populating the destination address.
    if (nonNullish(payment)) {
      const {
        token: paymentToken,
        identifier,
        amount: paymentAmount,
      } = payment;

      if (paymentToken !== token.symbol.toLowerCase()) {
        toastsError({
          labelKey: "error.qrcode_token_incompatible",
        });

        goForm();
        return;
      }

      selectedDestinationAddress = identifier;

      if (nonNullish(paymentAmount)) {
        amount = paymentAmount;
      }

      goForm();
      return;
    }

    selectedDestinationAddress = value;
    goForm();
  };
</script>

<WizardModal
  {testId}
  {steps}
  bind:currentStep
  bind:this={modal}
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
    >
      <slot name="additional-info-form" slot="additional-info" />
    </TransactionForm>
  {/if}
  {#if currentStep?.name === "Review" && nonNullish(sourceAccount) && amount !== undefined && selectedDestinationAddress !== undefined}
    <TransactionReview
      transaction={{
        destinationAddress: selectedDestinationAddress,
        sourceAccount,
        amount,
      }}
      {transactionFee}
      {disableSubmit}
      {token}
      {selectedNetwork}
      {showLedgerFee}
      on:nnsBack={goBack}
      on:nnsSubmit
      on:nnsClose
    >
      <slot name="additional-info-review" slot="additional-info" />
      <slot name="destination-info" slot="destination-info" />
      <slot name="description" slot="description" />
      <slot name="received-amount" slot="received-amount">
        <TransactionReceivedAmount {amount} {token} />
      </slot>
    </TransactionReview>
  {/if}
  {#if currentStep?.name === STEP_PROGRESS}
    <slot name="in_progress" />
  {/if}
  {#if currentStep?.name === STEP_QRCODE}
    <TransactionQRCode on:nnsCancel={goForm} on:nnsQRCode={onQRCode} />
  {/if}
</WizardModal>
