<script lang="ts">
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import { i18n } from "../../stores/i18n";
  import NewTransactionSource from "../../components/accounts/NewTransactionSource.svelte";
  import { createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";
  import type {
    TransactionContext,
    TransactionStore,
  } from "../../stores/transaction.store";
  import NewTransactionAmount from "../../components/accounts/NewTransactionAmount.svelte";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import NewTransactionReview from "../../components/accounts/NewTransactionReview.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { loadNeuron } from "../../services/neurons.services";
  import { neuronsStore } from "../../stores/neurons.store";

  export let neuron: NeuronInfo;

  let steps: Steps;
  $: steps = [
    {
      name: "SelectAccount",
      showBackButton: false,
      title: $i18n.accounts.select_source,
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
    selectedAccount: undefined,
    destinationAddress: neuron.fullNeuron?.accountIdentifier,
    amount: undefined,
  });

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: newTransactionStore,
    next: () => modal?.next(),
  });

  let currentStep: Step | undefined;
  let modal: WizardModal | undefined;

  const dispatcher = createEventDispatcher();
  const fetchUpdatedNeuron = async () => {
    await loadNeuron({
      neuronId: neuron.neuronId,
      forceFetch: true,
      setNeuron: ({ neuron, certified }) => {
        neuronsStore.pushNeurons({ neurons: [neuron], certified });
      },
    });
    dispatcher("nnsClose");
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? $i18n.accounts.select_source}</svelte:fragment
  >

  <svelte:fragment>
    {#if currentStep?.name === "SelectAccount"}
      <NewTransactionSource />
    {/if}
    {#if currentStep?.name === "SelectAmount"}
      <NewTransactionAmount />
    {/if}
    {#if currentStep?.name === "Review"}
      <NewTransactionReview on:nnsClose={fetchUpdatedNeuron} />
    {/if}
  </svelte:fragment>
</WizardModal>
