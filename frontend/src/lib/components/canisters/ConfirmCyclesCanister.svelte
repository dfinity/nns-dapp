<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { formatNumber } from "$lib/utils/format.utils";
  import { convertIcpToTCycles } from "$lib/utils/token.utils";
  import TransactionSource from "$lib/modals/accounts/NewTransaction/TransactionSource.svelte";

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
  <div class="conversion">
    <h3>{formatNumber(amount, { minFraction: 2, maxFraction: 2 })}</h3>
    <p>{$i18n.core.icp}</p>
    {#if tCyclesFormatted !== undefined}
      <p>{$i18n.canisters.converted_to}</p>
      <h3>
        {formatNumber(tCyclesFormatted, { minFraction: 2, maxFraction: 2 })}
      </h3>
      <p>{$i18n.canisters.t_cycles}</p>
    {/if}
  </div>
  <div>
    <TransactionSource {account} />
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
  @use "@dfinity/gix-components/styles/mixins/media";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .conversion {
    padding: 0 0 var(--padding-4x);

    p,
    h3 {
      margin: 0;
      display: inline-block;
    }

    @include media.min-width(small) {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--padding);
    }
  }
</style>
