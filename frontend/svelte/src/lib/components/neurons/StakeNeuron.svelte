<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Input from "../ui/Input.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import {
    E8S_PER_ICP,
    TRANSACTION_FEE_E8S,
  } from "../../constants/icp.constants";
  import { syncAccounts } from "../../services/accounts.services";
  import { stakeAndLoadNeuron } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { formatICP } from "../../utils/icp.utils";
  import { startBusy, stopBusy } from "../../stores/busy.store";

  export let account: Account;
  const transactionIcp: ICP = ICP.fromE8s(BigInt(TRANSACTION_FEE_E8S)) as ICP;
  let amount: number;
  let creating: boolean = false;
  const dispatcher = createEventDispatcher();

  const createNeuron = async () => {
    startBusy("stake-neuron");
    creating = true;
    const neuronId = await stakeAndLoadNeuron({
      amount,
      fromSubAccount: "subAccount" in account ? account.subAccount : undefined,
    });
    if (neuronId !== undefined) {
      // We don't wait for `syncAccounts` to finish to give a better UX to the user.
      // `syncAccounts` might be slow since it loads all accounts and balances.
      // in the neurons page there are no balances nor accounts
      syncAccounts();

      dispatcher("nnsNeuronCreated", { neuronId });
    }
    creating = false;
    stopBusy("stake-neuron");
  };

  const stakeMaximum = () => {
    amount =
      (Number(account.balance.toE8s()) - TRANSACTION_FEE_E8S) / E8S_PER_ICP;
  };
</script>

<div class="wizard-wrapper">
  <div>
    <h5>{$i18n.neurons.source}</h5>
    <small class="identifier">{account.identifier}</small>
  </div>
  <div class="transaction-fee">
    <h5>{$i18n.neurons.transaction_fee}</h5>
    <small>
      <span>{`${formatICP(transactionIcp.toE8s())}`}</span>
      <span>ICP</span>
    </small>
  </div>
  <div class="form">
    <p class="title">{$i18n.neurons.current_balance}</p>
    <h4 class="balance">
      {`${formatICP(account.balance.toE8s())}`}
    </h4>
    <form on:submit|preventDefault={createNeuron}>
      <Input
        placeholderLabelKey="neurons.amount"
        name="amount"
        bind:value={amount}
        theme="dark"
        inputType="number"
      >
        <button
          type="button"
          on:click|preventDefault={stakeMaximum}
          class="secondary small"
          slot="button">{$i18n.neurons.max}</button
        >
      </Input>
      <small>{$i18n.neurons.may_take_while}</small>
      <!-- TODO: L2-252 -->
      <button
        class="primary full-width"
        type="submit"
        data-tid="create-neuron-button"
        disabled={amount === undefined || amount <= 0 || creating}
      >
        {#if creating}
          <Spinner />
        {:else}
          {$i18n.neurons.create}
        {/if}
      </button>
    </form>
  </div>
</div>

<style lang="scss">
  small {
    word-break: break-all;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      color: var(--gray-400);
      font-size: var(--font-size-h3);
    }

    .balance {
      font-size: var(--font-size-h1);
    }
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    --input-width: 100%;

    small {
      margin-top: calc(2 * var(--padding));
    }

    button[type="submit"] {
      margin-top: var(--padding);
    }
  }

  .transaction-fee {
    flex-grow: 1;
  }
</style>
