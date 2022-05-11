<script lang="ts">
  import type { Account } from "../../types/account";
  import Card from "../ui/Card.svelte";
  import ICP from "../ic/ICP.svelte";
  import Identifier from "../ic/Identifier.svelte";
  import type { ICP as ICPType } from "@dfinity/nns";
  import type { Transaction } from "../../canisters/nns-dapp/nns-dapp.types";
  import {
    mapTransaction,
    transactionDisplayAmount,
    AccountTransactionType,
  } from "../../utils/accounts.utils";

  const getName = ({
    type,
    isReceive,
  }: {
    type: AccountTransactionType;
    isReceive: boolean;
  }) => {
    switch (type) {
      case AccountTransactionType.Send:
        return isReceive ? "Received ICP" : "Sent ICP";
      case AccountTransactionType.Mint:
        return "Received ICP";
      case AccountTransactionType.Burn:
        return "Sent ICP";
      case AccountTransactionType.StakeNeuron:
        return "Stake Neuron";
      case AccountTransactionType.StakeNeuronNotification:
        return "Stake Neuron (Part 2 of 2)";
      case AccountTransactionType.TopUpNeuron:
        return "Top-up Neuron";
      case AccountTransactionType.CreateCanister:
        return "Create Canister";
      case AccountTransactionType.TopUpCanister:
        return "Top-up Canister";
    }
  };

  export let account: Account;
  export let transaction: Transaction;

  const { identifier } = account;
  const { type, isReceive, from, to, amount, fee, date } = mapTransaction({
    transaction,
    account,
  });
  const displayAmount = transactionDisplayAmount({
    type,
    isReceive,
    amount,
    fee,
  });
</script>

<Card on:click>
  <div slot="start" class="title">
    <h3>Sent ICP</h3>
  </div>
  <ICP slot="end" icp={displayAmount} />
  <span>Date</span>
  <span>To: lasdfasdfjsadf</span>
  <div>Source: <Identifier {identifier} /></div>
</Card>

<style lang="scss">
  @use "../../themes/mixins/text.scss";
  @use "../../themes/mixins/card.scss";

  .title {
    @include card.stacked-title;
  }

  h3 {
    line-height: var(--line-height-standard);
    margin: 0 var(--padding) 0 0;

    @include text.truncate;
  }
</style>
