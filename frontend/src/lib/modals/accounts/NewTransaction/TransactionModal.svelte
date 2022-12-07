<script lang="ts">
  import { WizardModal } from "@dfinity/gix-components";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import TransactionForm from "./TransactionForm.svelte";
  import TransactionReview from "./TransactionReview.svelte";
  import { ICPToken, TokenAmount, type Token } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";

  export let rootCanisterId: Principal;
  export let currentStep: WizardStep | undefined = undefined;
  export let destinationAddress: string | undefined = undefined;
  export let sourceAccount: Account | undefined = undefined;
  export let token: Token = ICPToken;
  export let transactionFee: TokenAmount;
  export let disableSubmit = false;
  // Max amount accepted by the transaction wihout fees
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let validateAmount: (
    amount: number | undefined
  ) => string | undefined = () => undefined;
  // TODO: Add transaction fee as a Token parameter https://dfinity.atlassian.net/browse/L2-990

  const steps: WizardSteps = [
    {
      name: "Form",
      title: "",
    },
    {
      name: "Review",
      title: "",
    },
  ];

  let modal: WizardModal;

  // If destination or source are passed as prop, they are used.
  // But the component doesn't bind them to the props.
  // This way we can identify whether to show a dropdown to select destination or source.
  let selectedDestinationAddress: string | undefined = destinationAddress;
  let canSelectDestination = destinationAddress === undefined;
  let selectedAccount: Account | undefined = sourceAccount;
  let canSelectSource = sourceAccount === undefined;
  let amount: number | undefined;
  let showManualAddress = true;

  const goNext = () => {
    modal.next();
  };
  const goBack = () => {
    modal.back();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <slot name="title" slot="title" />
  {#if currentStep?.name === "Form"}
    <TransactionForm
      {rootCanisterId}
      {canSelectDestination}
      {canSelectSource}
      {transactionFee}
      {validateAmount}
      bind:selectedDestinationAddress
      bind:selectedAccount
      bind:amount
      bind:showManualAddress
      {skipHardwareWallets}
      {maxAmount}
      {token}
      on:nnsNext={goNext}
      on:nnsClose
    >
      <slot name="additional-info-form" slot="additional-info" />
    </TransactionForm>
  {/if}
  {#if currentStep?.name === "Review" && selectedAccount !== undefined && amount !== undefined && selectedDestinationAddress !== undefined}
    <TransactionReview
      transaction={{
        destinationAddress: selectedDestinationAddress,
        sourceAccount: selectedAccount,
        amount,
      }}
      {transactionFee}
      {disableSubmit}
      {token}
      on:nnsBack={goBack}
      on:nnsSubmit
      on:nnsClose
    >
      <slot name="additional-info-review" slot="additional-info" />
      <slot name="destination-info" slot="destination-info" />
      <slot name="description" slot="description" />
    </TransactionReview>
  {/if}
</WizardModal>
