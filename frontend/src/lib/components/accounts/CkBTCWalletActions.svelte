<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterId } from "$lib/types/canister";
  import { updateBalance as updateBalanceService } from "$lib/services/ckbtc-minter.services";

  export let minterCanisterId: CanisterId;
  export let reload: () => Promise<void>;

  // TODO(GIX-1320): ckBTC - update_balance is an happy path, improve UX once track_balance implemented
  const updateBalance = async () =>
    await updateBalanceService({
      minterCanisterId,
      reload,
    });
</script>

<div role="menubar">
  <button
    class="secondary"
    type="button"
    on:click={updateBalance}
    data-tid="manual-refresh-balance"
  >
    {$i18n.ckbtc.refresh_balance}
  </button>
</div>

<style lang="scss">
  @use "../../themes/mixins/section";

  div {
    @include section.actions;
  }
</style>
