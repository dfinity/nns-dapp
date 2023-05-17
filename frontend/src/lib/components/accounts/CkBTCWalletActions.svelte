<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterId } from "$lib/types/canister";
  import { updateBalance as updateBalanceService } from "$lib/services/ckbtc-minter.services";
  import { loadCkBTCAccountTransactions } from "$lib/services/ckbtc-transactions.services";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { Account } from "$lib/types/account";

  export let minterCanisterId: CanisterId;
  export let reload: () => Promise<void>;
  export let inline = false;
  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;

  // TODO(GIX-1320): ckBTC - update_balance is an happy path, improve UX once track_balance implemented
  const updateBalance = async () =>
    Promise.all([
      updateBalanceService({
        minterCanisterId,
        reload,
      }),
      loadCkBTCAccountTransactions({
        account,
        canisterId: universeId,
        indexCanisterId,
      }),
    ]);
</script>

<div
  role={!inline ? "menubar" : undefined}
  class:inline
  data-tid="manual-refresh-balance-container"
>
  <button
    class={inline ? "text" : "secondary"}
    type="button"
    on:click={updateBalance}
    data-tid="manual-refresh-balance"
  >
    {$i18n.ckbtc.refresh_balance}
  </button>
</div>

<style lang="scss">
  @use "../../themes/mixins/section";

  [role="menubar"] {
    @include section.actions;
  }

  .inline {
    display: inline-block;
  }

  .text {
    text-decoration: underline;
    padding: 0;
  }
</style>
