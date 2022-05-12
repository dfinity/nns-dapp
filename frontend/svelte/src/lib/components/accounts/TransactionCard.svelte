<script lang="ts">
  import type { Account } from "../../types/account";
  import Card from "../ui/Card.svelte";
  import ICP from "../ic/ICP.svelte";
  import Identifier from "../ic/Identifier.svelte";
  import type { ICP as ICPType } from "@dfinity/nns";
  import type {
    AccountIdentifierString,
    Transaction,
  } from "../../canisters/nns-dapp/nns-dapp.types";
  import {
    mapTransaction,
    AccountTransactionType,
  } from "../../utils/accounts.utils";
  import { i18n } from "../../stores/i18n";

  const getHeadline = ({
    type,
    isReceive,
  }: {
    type: AccountTransactionType;
    isReceive: boolean;
  }): string =>
    type === AccountTransactionType.Send
      ? isReceive
        ? $i18n.transaction_names.receive
        : $i18n.transaction_names.send
      : $i18n.transaction_names[type] ?? type;

  export let account: Account;
  export let transaction: Transaction;

  let type: AccountTransactionType;
  let isReceive: boolean;
  let isSend: boolean;
  let from: AccountIdentifierString | undefined;
  let to: AccountIdentifierString | undefined;
  let displayAmount: ICPType;
  let date: Date;
  $: ({ type, isReceive, isSend, from, to, displayAmount, date } =
    mapTransaction({
      transaction,
      account,
    }));

  let headline: string;
  $: headline = getHeadline({ type, isReceive });

  let label: string | undefined;
  $: label = isReceive
    ? $i18n.wallet.direction_from
    : isSend
    ? $i18n.wallet.direction_to
    : undefined;
  let identifier: string | undefined;
  $: identifier = isReceive ? from : to;
</script>

<Card on:click>
  <div slot="start" class="title">
    <h3>{headline}</h3>
  </div>
  <ICP slot="end" icp={displayAmount} sign={isReceive ? "+" : "-"} />
  <span>{date.toLocaleString()}</span>

  {#if identifier !== undefined}
    <Identifier {label} {identifier} showCopy />
  {/if}
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
