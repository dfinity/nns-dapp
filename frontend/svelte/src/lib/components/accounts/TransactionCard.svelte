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
  import { i18n } from "../../stores/i18n";
  import { secondsToDate, secondsToTime } from "../../utils/date.utils";
  import {
    AccountTransactionType,
    mapTransaction,
    transactionName,
  } from "../../utils/transactions.utils";
  import { toastsStore } from "../../stores/toasts.store";

  export let account: Account;
  export let transaction: Transaction;

  let type: AccountTransactionType;
  let isReceive: boolean;
  let isSend: boolean;
  let from: AccountIdentifierString | undefined;
  let to: AccountIdentifierString | undefined;
  let displayAmount: ICPType;
  let date: Date;
  $: account,
    transaction,
    (() => {
      try {
        ({ type, isReceive, isSend, from, to, displayAmount, date } =
          mapTransaction({
            transaction,
            account,
          }));
      } catch (err: unknown) {
        toastsStore.error(
          err instanceof Error
            ? { labelKey: err.message }
            : { labelKey: "error.unknown", err }
        );
      }
    })();

  let headline: string;
  $: headline = transactionName({
    type,
    isReceive,
    labels: $i18n.transaction_names,
  });

  let label: string | undefined;
  $: label = isReceive
    ? $i18n.wallet.direction_from
    : isSend
    ? $i18n.wallet.direction_to
    : undefined;
  let identifier: string | undefined;
  $: identifier = isReceive ? from : to;
  let seconds: number;
  $: seconds = date.getTime() / 1000;
</script>

<Card testId="transaction-card">
  <div slot="start" class="title">
    <h3>{headline}</h3>
  </div>
  <ICP slot="end" icp={displayAmount} sign={isReceive ? "+" : "-"} />
  <p>{secondsToDate(seconds)} {secondsToTime(seconds)}</p>

  {#if identifier !== undefined}
    <Identifier size="medium" {label} {identifier} />
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

  p {
    margin-top: 0;
  }
</style>
