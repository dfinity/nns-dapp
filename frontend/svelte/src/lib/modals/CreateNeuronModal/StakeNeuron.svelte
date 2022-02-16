<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import Input from "../../components/ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { formatICP } from "../../utils/icp.utils";

  export let account: Account;
  const transactionIcp: ICP = ICP.fromString("0.0001") as ICP;
  let amount: number;

  const createNeuron = () => {
    // TODO: L2-226 Create neuron functionality
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
    <form on:submit={createNeuron}>
      <Input
        placeholderLabelKey="neurons.amount"
        name="amount"
        bind:value={amount}
        theme="dark"
      />
      <small>{$i18n.neurons.may_take_while}</small>
      <!-- TODO: L2-252 -->
      <button class="primary full-width" type="submit" disabled={!amount}
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

    button {
      margin-top: var(--padding);
    }
  }
</style>
