<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { formatNumber } from "$lib/utils/format.utils";
  import { convertIcpToTCycles } from "$lib/utils/token.utils";
  import TransactionSource from "$lib/components/transaction/TransactionSource.svelte";
  import { ICPToken } from "@dfinity/nns";

  export let amount: number;
  export let account: Account;
  export let icpToCyclesExchangeRate: bigint | undefined = undefined;

  let tCyclesFormatted: number | undefined;
  $: tCyclesFormatted =
    icpToCyclesExchangeRate !== undefined
      ? convertIcpToTCycles({
          icpNumber: amount,
          exchangeRate: icpToCyclesExchangeRate,
        })
      : undefined;

  const dispatcher = createEventDispatcher();
  const confirm = () => {
    dispatcher("nnsConfirm");
  };
</script>

<div class="wrapper" data-tid="confirm-cycles-canister-screen">
  <p class="conversion">
    <span
      ><span class="value"
        >{formatNumber(amount, { minFraction: 2, maxFraction: 2 })}</span
      >
      <span>{$i18n.core.icp}</span></span
    >
    {#if tCyclesFormatted !== undefined}
      <span class="description">{$i18n.canisters.converted_to}</span>
      <span
        ><span class="value">
          {formatNumber(tCyclesFormatted, { minFraction: 2, maxFraction: 2 })}
        </span>
        <span>{$i18n.canisters.t_cycles}</span></span
      >
    {/if}
  </p>
  <div>
    <TransactionSource {account} token={ICPToken} />
  </div>
  <slot />

  <div class="toolbar">
    <button
      class="secondary"
      on:click={() => dispatcher("nnsBack")}
      data-tid="confirm-cycles-canister-button-back"
      >{$i18n.canisters.edit_cycles}</button
    >
    <button
      class="primary"
      on:click={confirm}
      data-tid="confirm-cycles-canister-button">{$i18n.core.confirm}</button
    >
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .value {
    @include fonts.h3;
  }

  .conversion {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--padding-0_5x);
  }
</style>
