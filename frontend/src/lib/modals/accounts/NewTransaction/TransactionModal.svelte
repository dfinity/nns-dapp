<script lang="ts">
  import WizardModal from "../../WizardModal.svelte";
  import type { Step, Steps } from "../../../stores/steps.state";
  import type { Account } from "../../../types/account";
  import TransactionForm from "./TransactionForm.svelte";
  import TransactionReview from "./TransactionReview.svelte";

  export let currentStep: Step | undefined = undefined;
  export let destinationAddress: string | undefined = undefined;
  export let sourceAccount: Account | undefined = undefined;
  export let disableSubmit: boolean = false;
  // Max amount accepted by the transaction wihout fees
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets: boolean = false;
  // TODO: Add transaction fee as a Token parameter https://dfinity.atlassian.net/browse/L2-990

  const steps: Steps = [
    {
      name: "Form",
      showBackButton: false,
      title: "",
    },
    {
      name: "Review",
      showBackButton: true,
      title: "",
    },
  ];

  let modal: WizardModal;

  // If destination or source are passed as prop, they are used.
  // But the component doesn't bind them to the props.
  // This way we can identify whether to show a dropdown to select destination or source.
  let selectedDestinationAddress: string | undefined = destinationAddress;
  let canSelectDestination: boolean = destinationAddress === undefined;
  let selectedAccount: Account | undefined = sourceAccount;
  let canSelectSource: boolean = sourceAccount === undefined;
  let amount: number | undefined;

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
      {canSelectDestination}
      {canSelectSource}
      bind:selectedDestinationAddress
      bind:selectedAccount
      bind:amount
      {skipHardwareWallets}
      {maxAmount}
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
      {disableSubmit}
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
