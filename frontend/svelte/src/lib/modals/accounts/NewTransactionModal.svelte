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
  } from "../../types/transaction.context";
  import NewTransactionAmount from "../../components/accounts/NewTransactionAmount.svelte";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../types/transaction.context";
  import NewTransactionReview from "../../components/accounts/NewTransactionReview.svelte";
  import type { Account } from "../../types/account";
  import { debugTransactionStore } from "../../stores/debug.store";

  export let selectedAccount: Account | undefined = undefined;
  export let destinationAddress: string | undefined = undefined;
  export let onTransactionComplete: (() => Promise<void>) | undefined =
    undefined;

  let canSelectAccount: boolean;
  $: canSelectAccount = selectedAccount === undefined;

  let canSelectDestination: boolean;
  $: canSelectDestination = destinationAddress === undefined;

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
    ...((canSelectDestination
      ? [
          {
            name: "SelectDestination",
            showBackButton: canSelectAccount,
            title: $i18n.accounts.select_destination,
          },
        ]
      : []) as Steps),
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

  /**
   * A store that contains transaction information - i.e. information that are used to issue a new transaction between accounts.
   * For example: transferring ICP from main- to a subaccount
   *
   */
  const newTransactionStore = writable<TransactionStore>({
    selectedAccount,
    destinationAddress,
    amount: undefined,
  });

  debugTransactionStore(newTransactionStore);

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: newTransactionStore,
    next: () => modal?.next(),
    onTransactionComplete,
  });

  // Update store with selectedAccount in case the property would be set after the component is initialized
  $: newTransactionStore.update((data) => ({
    ...data,
    selectedAccount,
  }));

  // Update store with destinationAddress in case the property would be set after the component is initialized
  $: newTransactionStore.update((data) => ({
    ...data,
    destinationAddress,
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
