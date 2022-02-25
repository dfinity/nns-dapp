<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Input from "../../components/ui/Input.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import {
    E8S_PER_ICP,
    TRANSACTION_FEE_E8S,
  } from "../../constants/icp.constants";
  import { stakeNeuron } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { formatICP } from "../../utils/icp.utils";

  export let account: Account;
  const transactionIcp: ICP = ICP.fromE8s(BigInt(TRANSACTION_FEE_E8S)) as ICP;
  let amount: number;
  let creating: boolean = false;
  const dispatcher = createEventDispatcher();

  const createNeuron = async () => {
    creating = true;
    try {
      await stakeNeuron({
        stake: ICP.fromE8s(BigInt(amount * E8S_PER_ICP)),
      });
      // TODO: L2-313 sync accounts after creating neuron to update balance.
      dispatcher("nnsClose");
    } catch (err) {
      // TODO: Manage errors
      console.error(err);
    } finally {
      creating = false;
    }
  };

  const stakeMaximum = () => {
    amount =
      (Number(account.balance.toE8s()) - TRANSACTION_FEE_E8S) / E8S_PER_ICP;
  };
</script>

<section>
  <div>
    <h5>{$i18n.neurons.source}</h5>
    <small class="identifier">{account.identifier}</small>
  </div>
  <div>
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
      >
        <button
          type="button"
          on:click|preventDefault={stakeMaximum}
          class="primary small"
          slot="button">{$i18n.neurons.max}</button
        >
      </Input>
      <small>{$i18n.neurons.may_take_while}</small>
      <!-- TODO: L2-252 -->
      <button
        class="primary full-width"
        type="submit"
        disabled={!amount || creating}
      >
        {#if creating}
          <Spinner />
        {:else}
          {$i18n.neurons.create}
        {/if}
      </button>
    </form>
  </div>
</section>

<style lang="scss">
  section {
    color: var(--background-contrast);
    display: flex;
    flex-direction: column;
    gap: calc(2 * var(--padding));
    padding: 0;
  }

  small {
    word-break: break-all;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 0 calc(2 * var(--padding));

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
</style>
