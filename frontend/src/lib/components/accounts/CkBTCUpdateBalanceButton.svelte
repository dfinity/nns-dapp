<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterId } from "$lib/types/canister";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { updateBalance as updateBalanceService } from "$lib/services/ckbtc-minter.services";

  export let universeId: UniverseCanisterId;
  export let minterCanisterId: CanisterId;
  export let reload: () => Promise<void>;
  export let inline = false;

  // TODO(GIX-1320): ckBTC - update_balance is an happy path, improve UX once track_balance implemented
  const updateBalance = async () =>
    await updateBalanceService({
      universeId,
      minterCanisterId,
      reload,
      deferReload: true,
    });
</script>

<button
  class={inline ? "text" : "secondary"}
  type="button"
  on:click={updateBalance}
  data-tid="manual-refresh-balance"
>
  {$i18n.ckbtc.refresh_balance}
</button>

<style lang="scss">
  .text {
    text-decoration: underline;
    padding: 0;
  }
</style>
