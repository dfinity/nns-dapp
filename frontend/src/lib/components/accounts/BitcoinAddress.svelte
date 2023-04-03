<script lang="ts">
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import { getBTCAddress } from "$lib/services/ckbtc-minter.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { onMount } from "svelte";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import type { Account, AccountIdentifierText } from "$lib/types/account";
  import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
  import { nonNullish } from "@dfinity/utils";
  import type { BtcAddressText } from "$lib/types/bitcoin";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner } from "@dfinity/gix-components";

  export let account: Account;
  export let minterCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;

  let identifier: AccountIdentifierText;
  $: ({ identifier } = account);

  let btcAddress: undefined | BtcAddressText;
  $: btcAddress = $bitcoinAddressStore[identifier];

  // We load the BTC address once per session
  let btcAddressLoaded = false;
  $: btcAddressLoaded = nonNullish($bitcoinAddressStore[identifier]);

  const loadBtcAddress = async () => {
    // TODO: to be removed when ckBTC with minter is live.
    if (!isUniverseCkTESTBTC(universeId)) {
      return;
    }

    console.log("btcAddressLoaded", btcAddressLoaded);

    if (btcAddressLoaded) {
      return;
    }

    try {
      // TODO(GIX-1303): ckBTC - derive the address in frontend. side note: should we keep track of the address in a store?
      const btcAddress = await getBTCAddress(minterCanisterId);

      bitcoinAddressStore.set({ identifier, btcAddress });
    } catch (err: unknown) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_address",
        err,
      });
    }
  };

  onMount(async () => await loadBtcAddress());
</script>

<p class="description">
  {$i18n.ckbtc.incoming_bitcoin_network} <a
    href={`https://dashboard.internetcomputer.org/?id=${btcAddress ?? ""}`}
    aria-disabled={!btcAddressLoaded}
    >{$i18n.ckbtc.block_explorer}
    {#if !btcAddressLoaded}
      <div class="spinner">
        <Spinner size="small" inline />
      </div>
    {/if}
  </a>.
</p>

<style lang="scss">
  div {
    position: relative;
  }

  a {
    display: inline-flex;
    gap: var(--padding-0_25x);

    &[aria-disabled="true"] {
      pointer-events: none;
      color: var(--disable-contrast);
      text-decoration: none;
    }
  }

  .spinner {
    display: inline-block;
    width: 0.8rem;
  }
</style>
