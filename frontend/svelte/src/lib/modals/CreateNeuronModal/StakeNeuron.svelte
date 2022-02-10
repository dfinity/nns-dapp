<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import Input from "../../components/ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { formatICP } from "../../utils/icp.utils";

  export let account: Account;
  const transactionIcp = ICP.fromString("0.0001") as ICP;
  let amount: number;

  const createNeuron = () => {
    console.log("creating", amount);
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
      <span>{`${formatICP(transactionIcp.toE8s(), { max: 4 })}`}</span>
      <span>ICP</span>
    </small>
  </div>
  <div class="form">
    <p class="title">{$i18n.neurons.current_balance}</p>
    <h4 class="balance">
      {`${formatICP(account.balance.toE8s(), { max: 4, min: 4 })}`}
    </h4>
    <form on:submit={createNeuron}>
      <Input
        placeholderLabelKey="neurons.amount"
        name="amount"
        bind:value={amount}
      />
      <small>{`(${$i18n.neurons.may_take_while})`}</small>
      <button class="primary" type="submit" disabled
        >{$i18n.neurons.create}</button
      >
    </form>
  </div>
</section>

<style lang="scss">
  section {
    color: var(--background-contrast);
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    padding: 0;
  }

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

    small {
      margin-top: 2rem;
    }

    button {
      margin-top: 1rem;
    }
  }
</style>
