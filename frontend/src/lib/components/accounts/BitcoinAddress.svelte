<script lang="ts">
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import type { Account, IcpAccountIdentifier } from "$lib/types/account";
  import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
  import { nonNullish } from "@dfinity/utils";
  import type { BtcAddressText } from "$lib/types/bitcoin";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner } from "@dfinity/gix-components";
  import {
    BITCOIN_BLOCK_EXPLORER_MAINNET_URL,
    BITCOIN_BLOCK_EXPLORER_TESTNET_URL,
  } from "$lib/constants/bitcoin.constants";
  import { onMount } from "svelte";
  import { loadBtcAddress } from "$lib/services/ckbtc-minter.services";
  import CkBTCWalletActions from "$lib/components/accounts/CkBTCWalletActions.svelte";
  import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let account: Account;
  export let minterCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let reload: () => Promise<void>;

  let identifier: IcpAccountIdentifier;
  $: ({ identifier } = account);

  let btcAddress: undefined | BtcAddressText;
  $: btcAddress = $bitcoinAddressStore[identifier];

  // We load the BTC address once per session
  let btcAddressLoaded = false;
  $: btcAddressLoaded = nonNullish($bitcoinAddressStore[identifier]);

  let blockExplorerUrl: string;
  $: blockExplorerUrl = `${
    isUniverseCkTESTBTC(universeId)
      ? BITCOIN_BLOCK_EXPLORER_TESTNET_URL
      : BITCOIN_BLOCK_EXPLORER_MAINNET_URL
  }/${btcAddress ?? ""}`;

  onMount(() =>
    loadBtcAddress({
      minterCanisterId,
      identifier: account.identifier,
    })
  );

  let minConfirmations: number | undefined;
  $: minConfirmations =
    $ckBTCInfoStore[universeId.toText()]?.info.min_confirmations;

  // TODO: incoming_bitcoin_network_part_1 comes before incoming_bitcoin_network_part_2. It would be more worth creating a component or directive that can replace placeholders of the i18n with Svelte components
</script>

<p class="description">
  {replacePlaceholders($i18n.ckbtc.incoming_bitcoin_network_part_1, {
    $min: `${minConfirmations ?? ""}`,
  })}

  <CkBTCWalletActions inline {minterCanisterId} {reload} />

  {$i18n.ckbtc.incoming_bitcoin_network_part_2}
  <a
    data-tid="block-explorer-link"
    href={btcAddressLoaded ? blockExplorerUrl : ""}
    rel="noopener noreferrer external"
    target="_blank"
    aria-disabled={!btcAddressLoaded}
    >{$i18n.ckbtc.block_explorer}
    {#if !btcAddressLoaded}
      <div class="spinner">
        <Spinner size="tiny" inline />
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
    align-items: center;
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

  .description {
    margin-bottom: var(--padding-2x);
  }
</style>
