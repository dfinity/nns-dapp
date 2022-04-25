<script lang="ts">
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import { i18n } from "../../stores/i18n";
  import NewTransactionDestination from "../../components/accounts/NewTransactionDestination.svelte";
  import NewTransactionSource from "../../components/accounts/NewTransactionSource.svelte";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import type {
    TransactionContext,
    TransactionStore,
  } from "../../stores/transaction.store";
  import NewTransactionAmount from "../../components/accounts/NewTransactionAmount.svelte";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import NewTransactionReview from "../../components/accounts/NewTransactionReview.svelte";
  import type { Account } from "../../types/account";

  export let selectedAccount: Account | undefined = undefined;

  let canSelectAccount: boolean;
  $: canSelectAccount = selectedAccount === undefined;

  let steps: Steps;
  $: steps = [
    ...((canSelectAccount
      ? [
          {
            name: "SelectAccount",
            showBackButton: false,
            title: $i18n.accounts.select_source,
          },
        ]
      : []) as Steps),
    {
      name: "SelectDestination",
      showBackButton: canSelectAccount,
      title: $i18n.accounts.select_destination,
    },
    {
      name: "SelectAmount",
      showBackButton: true,
      title: $i18n.accounts.enter_icp_amount,
    },
    {
      name: "Review",
      showBackButton: true,
      title: $i18n.accounts.review_transaction,
    },
  ];

  const newTransactionStore = writable<TransactionStore>({
    selectedAccount,
    destinationAddress: undefined,
    amount: undefined,
  });

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: newTransactionStore,
    next: () => modal?.next(),
  });

  // Update store with selectedAccount in case the property would be set after the component is initialized
  $: newTransactionStore.update((data) => ({
    ...data,
    selectedAccount,
  }));

  let currentStep: Step | undefined;
  let modal: WizardModal | undefined;
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? $i18n.accounts.add_account}</svelte:fragment
  >

  <svelte:fragment>
    {#if currentStep?.name === "SelectAccount"}
      <NewTransactionSource />
    {/if}
    {#if currentStep?.name === "SelectDestination"}
      <NewTransactionDestination />
    {/if}
    {#if currentStep?.name === "SelectAmount"}
      <NewTransactionAmount />
    {/if}
    {#if currentStep?.name === "Review"}
      <NewTransactionReview on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
