<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { formatNumber } from "../../utils/format.utils";
  import { convertIcpToTCycles } from "../../utils/icp.utils";

  export let amount: number;
  export let account: Account;
  export let icpToCyclesRatio: bigint | undefined = undefined;

  let tCyclesFormatted: number | undefined;
  $: tCyclesFormatted =
    icpToCyclesRatio !== undefined
      ? convertIcpToTCycles({ icpNumber: amount, ratio: icpToCyclesRatio })
      : undefined;

  const dispatcher = createEventDispatcher();
  const confirm = () => {
    dispatcher("nnsConfirm");
  };
</script>

<div class="wizard-wrapper wrapper" data-tid="confirm-cycles-canister-screen">
  <div class="content">
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
      <h5>{$i18n.accounts.source}</h5>
      <p>{account.identifier}</p>
    </div>
    <slot />
  </div>
  <button
    class="primary full-width"
    on:click={confirm}
    data-tid="confirm-cycles-canister-button">{$i18n.core.confirm}</button
  >
</div>

<style lang="scss">
  .wizard-wrapper.wrapper {
    justify-content: space-between;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    gap: var(--padding);
  }

  .conversion {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--padding);
    margin-bottom: var(--padding-3x);

    p,
    h3 {
      margin: 0;
    }
  }
</style>
