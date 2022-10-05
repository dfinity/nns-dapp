<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { syncAccounts } from "$lib/services/accounts.services";
  import { stakeNeuron } from "$lib/services/neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { busy, startBusy, stopBusy } from "$lib/stores/busy.store";
  import {
    formattedTransactionFeeICP,
    getMaxTransactionAmount,
  } from "$lib/utils/icp.utils";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import {
    mainTransactionFeeStore,
    transactionsFeesStore,
  } from "$lib/stores/transaction-fees.store";
  import FooterModal from "$lib/modals/FooterModal.svelte";
  import Value from "$lib/components/ui/Value.svelte";

  export let account: Account;
  let amount: number;

  const dispatcher = createEventDispatcher();

  const createNeuron = async () => {
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
      // We don't wait for `syncAccounts` to finish to give a better UX to the user.
      // `syncAccounts` might be slow since it loads all accounts and balances.
      // in the neurons page there are no balances nor accounts
      syncAccounts();

      dispatcher("nnsNeuronCreated", { neuronId });
    }

    stopBusy("stake-neuron");
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: account.balance.toE8s(),
    fee: $transactionsFeesStore.main,
  });

  const stakeMaximum = () => (amount = max);
</script>

<form on:submit|preventDefault={createNeuron} class="wizard-wrapper">
  <div class="head">
    <CurrentBalance balance={account.balance} />

    <AmountInput bind:amount on:nnsMax={stakeMaximum} {max} />
  </div>

  <div>
    <p class="label">{$i18n.neurons.source}</p>
    <small class="identifier value">{account.identifier}</small>
  </div>
  <div class="transaction-fee">
    <p class="label">{$i18n.neurons.transaction_fee}</p>
    <small>
      <Value>{formattedTransactionFeeICP($mainTransactionFeeStore)}</Value>
      <span>ICP</span>
    </small>
  </div>

  <FooterModal>
    <button
      class="secondary"
      type="button"
      on:click={() => dispatcher("nnsBack")}
    >
      {$i18n.neurons.edit_source}
    </button>
    <button
      class="primary"
      type="submit"
      data-tid="create-neuron-button"
      disabled={amount === undefined || amount <= 0 || $busy}
    >
      {$i18n.neurons.create}
    </button>
  </FooterModal>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  .head {
    @include modal.header;
  }

  small {
    word-break: break-all;
    text-align: center;
  }

  .transaction-fee {
    flex-grow: 1;
  }
</style>
