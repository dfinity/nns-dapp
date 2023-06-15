<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { loadBalance } from "$lib/services/accounts.services";
  import { stakeNeuron } from "$lib/services/neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { getMaxTransactionAmount } from "$lib/utils/token.utils";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
  import { busy } from "@dfinity/gix-components";
  import TransactionFromAccount from "$lib/components/transaction/TransactionFromAccount.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { isNullish } from "@dfinity/utils";
  import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";
  import { toastsError } from "$lib/stores/toasts.store";
  import { ICPToken } from "@dfinity/nns";

  export let account: Account | undefined;
  let amount: number;

  const dispatcher = createEventDispatcher();

  const createNeuron = async () => {
    if (isNullish(account)) {
      toastsError({
        labelKey: "error__account.not_selected",
      });
      return;
    }

    const isHardwareWallet = isAccountHardwareWallet(account);

    startBusy({
      initiator: "stake-neuron",
      labelKey: isHardwareWallet
        ? "busy_screen.pending_approval_hw"
        : "neurons.may_take_while",
    });

    const neuronId = await stakeNeuron({
      amount,
      account,
      loadNeuron: !isHardwareWallet,
    });
    if (neuronId !== undefined) {
      // We don't wait for `loadBalance` to finish to give a better UX to the user.
      // Update calls might be slow.
      // But in the neurons page there are no balances nor accounts
      loadBalance({ accountIdentifier: account.identifier });

      dispatcher("nnsNeuronCreated", { neuronId });
    }

    stopBusy("stake-neuron");
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: account?.balanceE8s ?? 0n,
    fee: $transactionsFeesStore.main,
  });

  const stakeMaximum = () => (amount = max);

  const close = () => dispatcher("nnsClose");
</script>

<form
  on:submit|preventDefault={createNeuron}
  data-tid="nns-stake-neuron-component"
>
  <TransactionFromAccount
    bind:selectedAccount={account}
    canSelectSource={true}
    rootCanisterId={OWN_CANISTER_ID}
    token={ICPToken}
  />

  <AmountInput bind:amount on:nnsMax={stakeMaximum} {max} />

  <TransactionFormFee transactionFee={$mainTransactionFeeStoreAsToken}>
    <svelte:fragment slot="label"
      >{$i18n.neurons.transaction_fee}</svelte:fragment
    >
  </TransactionFormFee>

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="stake-neuron-button-cancel"
      type="button"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="primary"
      type="submit"
      data-tid="create-neuron-button"
      disabled={amount === undefined ||
        amount <= 0 ||
        $busy ||
        isNullish(account)}
    >
      {$i18n.neurons.create}
    </button>
  </div>
</form>
