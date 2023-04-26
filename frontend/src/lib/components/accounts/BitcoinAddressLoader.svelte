<script lang="ts">
  import { getBTCAddress } from "$lib/services/ckbtc-minter.services";
  import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { AccountIdentifierText } from "$lib/types/account";
  import type { CanisterId } from "$lib/types/canister";

  export let universeId: UniverseCanisterId;
  export let minterCanisterId: CanisterId;
  export let identifier: AccountIdentifierText | undefined;

  // TODO: to be removed when ckBTC with minter is live.
  let enabled = false;
  $: enabled = isUniverseCkTESTBTC(universeId);

  // We load the BTC address once per session
  let btcAddressLoaded = false;
  $: btcAddressLoaded =
    nonNullish(identifier) && nonNullish($bitcoinAddressStore[identifier]);

  const loadBtcAddress = async () => {
    if (!enabled) {
      return;
    }

    if (btcAddressLoaded) {
      return;
    }

    if (isNullish(identifier)) {
      return;
    }

    try {
      const btcAddress = await getBTCAddress(minterCanisterId);

      bitcoinAddressStore.set({ identifier, btcAddress });
    } catch (err: unknown) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_address",
        err,
      });
    }
  };

  // When used in ckBTC receive modal, the identifier is originally undefined that's why we reload when it changes
  $: identifier, (async () => await loadBtcAddress())();
</script>

<slot />
