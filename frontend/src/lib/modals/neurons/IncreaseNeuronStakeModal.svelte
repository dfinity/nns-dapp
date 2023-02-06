<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { topUpNeuron } from "$lib/services/neurons.services";
  import type { NewTransaction } from "$lib/types/transaction";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import TransactionModal from "../accounts/NewTransaction/TransactionModal.svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import type { WizardStep } from "@dfinity/gix-components";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";

  export let neuron: NeuronInfo;

  let currentStep: WizardStep;

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

    // We close the modal in case of success or error if the selected source is not a hardware wallet.
    // In case of hardware wallet, the error messages might contain interesting information for the user such as "your device is idle"
    if (success || !isAccountHardwareWallet(sourceAccount)) {
      dispatcher("nnsClose");
    }
  };
</script>

<!-- Don't show the modal if neuron doesn't have the account -->
<!-- That would be an edge case that would not happen becuase then the button won't even be there -->
{#if neuron.fullNeuron?.accountIdentifier !== undefined}
  <TransactionModal
    rootCanisterId={OWN_CANISTER_ID}
    on:nnsSubmit={topUp}
    on:nnsClose
    bind:currentStep
    destinationAddress={neuron.fullNeuron?.accountIdentifier}
    transactionFee={$mainTransactionFeeStoreAsToken}
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.neurons.top_up_neuron}</svelte:fragment
    >
    <p slot="description" class="value">
      {replacePlaceholders($i18n.neurons.top_up_description, {
        $neuronId: neuron.neuronId.toString(),
      })}
    </p>
  </TransactionModal>
{/if}
