<script lang="ts">
  import BITCOIN_LOGO from "$lib/assets/bitcoin.svg";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import type { Account } from "$lib/types/account";
  import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
  import { nonNullish } from "@dfinity/utils";
  import type { BtcAddressText } from "$lib/types/bitcoin";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText, Spinner, QRCode, Copy } from "@dfinity/gix-components";
  import {
    BITCOIN_BLOCK_EXPLORER_MAINNET_URL,
    BITCOIN_BLOCK_EXPLORER_TESTNET_URL,
  } from "$lib/constants/bitcoin.constants";
  import { onMount } from "svelte";
  import { loadBtcAddress } from "$lib/services/ckbtc-minter.services";
  import CkBTCWalletActions from "$lib/components/accounts/CkBTCWalletActions.svelte";
  import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { IcrcAccountIdentifierText } from "$lib/types/icrc";

  export let account: Account;
  export let minterCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let reload: () => Promise<void>;

  let identifier: IcrcAccountIdentifierText;
  $: ({ identifier } = account);

  let btcAddress: undefined | BtcAddressText;
  $: btcAddress = $bitcoinAddressStore[identifier];

  // We load the BTC address once per session
  let btcAddressLoaded = false;
  $: btcAddressLoaded = nonNullish(btcAddress);

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
</script>

<div class="grid" data-tid="bitcoin-address-component">
  <div class="info-section">
    <h4 class="content-cell-title">
      {$i18n.ckbtc.receive_btc_title}
    </h4>
    <div class="content-cell-details info-section">
      <p class="description">
        {$i18n.ckbtc.ckbtc_buzz_words}
        {replacePlaceholders($i18n.ckbtc.incoming_bitcoin_network, {
          $min: `${minConfirmations ?? ""}`,
        })}
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
    </div>
  </div>

  <div class="qr-code">
    {#if nonNullish(btcAddress)}
      <QRCode value={btcAddress}>
        <div class="logo" slot="logo">
          <Logo
            src={BITCOIN_LOGO}
            size="medium"
            framed={false}
            testId="logo"
            alt="ckBTC logo"
          />
        </div>
      </QRCode>
    {:else}
      <Spinner />
    {/if}
  </div>

  <div class="address-section">
    <div class="content-cell-details">
      <div>
        <div class="content-cell-title">
          {$i18n.ckbtc.bitcoin_address_title}
        </div>
        {#if nonNullish(btcAddress)}
          <div class="address">
            <span class="value" data-tid="btc-address">{btcAddress}</span>
            <Copy value={btcAddress} />
          </div>
        {:else}
          <div class="skeleton">
            <SkeletonText />
          </div>
        {/if}
      </div>
    </div>
    <div class="content-cell-details">
      <div class="button">
        <CkBTCWalletActions {universeId} {minterCanisterId} {reload} />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

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

  .info-section {
    grid-area: info;
    margin-bottom: var(--padding);
  }

  .address-section {
    grid-area: addr;
    .skeleton {
      // To make the skeleton text, match the height of the address when it has
      // a copy button, which is 32px high, to avoid jumping when the address
      // is loaded.
      height: 32px;
      // To prevent the margin on the skeleton interfering with the height of
      // the container.
      overflow: hidden;
    }

    .address {
      word-break: break-all;
      display: flex;
      align-items: center;
      gap: var(--padding);
      margin: 0;
    }
  }

  .qr-code {
    grid-area: qr;
    background: white;
    width: calc(16 * var(--padding));
    height: calc(16 * var(--padding));
    border: var(--padding) solid white;
    border-radius: var(--border-radius);

    .logo {
      width: calc(5 * var(--padding));
      height: calc(5 * var(--padding));
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .grid {
    display: grid;
    grid-template-areas:
      "info"
      "qr"
      "addr";
  }

  @include media.min-width(small) {
    .grid {
      grid-template-areas:
        "info qr"
        "addr qr";
      grid-template-columns: 1fr auto;
      column-gap: var(--padding-2x);
    }
  }
</style>
