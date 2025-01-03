<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { pollAccounts } from "$lib/services/icp-accounts.services";
  import { topUpNeuron } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction, TransactionInit } from "$lib/types/transaction";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher, onMount } from "svelte";

  export let neuron: NeuronInfo;

  let transactionInit: TransactionInit = {
    destinationAddress: neuron.fullNeuron?.accountIdentifier,
  };

  onMount(() => {
    pollAccounts();
  });

  let currentStep: WizardStep | undefined;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.neurons.top_up_neuron
      : $i18n.accounts.review_transaction;

  const dispatcher = createEventDispatcher();
  const topUp = async ({
    detail: { sourceAccount, amount },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "top-up-neuron",
      labelKey: isAccountHardwareWallet(sourceAccount)
        ? "busy_screen.pending_approval_hw"
        : "neurons.may_take_while",
    });

    const { success } = await topUpNeuron({
      neuron,
      sourceAccount,
      amount,
    });

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
    }

    stopBusy("top-up-neuron");

    // We close the modal in case of success or error if the selected source is not a Ledger device.
    // In case of Ledger device, the error messages might contain interesting information for the user such as "your device is idle"
    if (success || !isAccountHardwareWallet(sourceAccount)) {
      dispatcher("nnsClose");
    }
  };
</script>

<!-- Don't show the modal if neuron doesn't have the account -->
<!-- That would be an edge case that would not happen becuase then the button won't even be there -->
{#if neuron.fullNeuron?.accountIdentifier !== undefined}
  <TransactionModal
    testId="increase-neuron-stake-modal-component"
    rootCanisterId={OWN_CANISTER_ID}
    on:nnsSubmit={topUp}
    on:nnsClose
    bind:currentStep
    {transactionInit}
    transactionFee={$mainTransactionFeeStoreAsToken}
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.neurons.top_up_neuron}</svelte:fragment
    >
    <p slot="description" class="value no-margin">
      {replacePlaceholders($i18n.neurons.top_up_description, {
        $neuronId: neuron.neuronId.toString(),
      })}
    </p>
  </TransactionModal>
{/if}
