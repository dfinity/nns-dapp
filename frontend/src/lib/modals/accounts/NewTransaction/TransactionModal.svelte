<script lang="ts">
  import LegacyWizardModal from "$lib/components/modals/LegacyWizardModal.svelte";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import type { Account } from "$lib/types/account";
  import TransactionForm from "./TransactionForm.svelte";
  import TransactionReview from "./TransactionReview.svelte";
  import { ICPToken, TokenAmount, type Token } from "@dfinity/nns";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";

  export let currentStep: Step | undefined = undefined;
  export let destinationAddress: string | undefined = undefined;
  export let sourceAccount: Account | undefined = undefined;
  export let token: Token = ICPToken;
  export let transactionFee: TokenAmount = $mainTransactionFeeStoreAsToken;
  export let disableSubmit = false;
  // Max amount accepted by the transaction wihout fees
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
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

  let modal: LegacyWizardModal;

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

<LegacyWizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <slot name="title" slot="title" />
  {#if currentStep?.name === "Form"}
    <TransactionForm
      {canSelectDestination}
      {canSelectSource}
      {transactionFee}
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
</LegacyWizardModal>
