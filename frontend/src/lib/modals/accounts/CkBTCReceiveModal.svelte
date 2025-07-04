<script lang="ts">
  import BITCOIN_LOGO from "$lib/assets/bitcoin.svg";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
  import BitcoinKYTFee from "$lib/components/accounts/BitcoinKYTFee.svelte";
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import ReceiveSelectAccountDropdown from "$lib/components/accounts/ReceiveSelectAccountDropdown.svelte";
  import { QR_CODE_RENDERED_DEFAULT_STATE } from "$lib/constants/mockable.constants";
  import { loadBtcAddress } from "$lib/services/ckbtc-minter.services";
  import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { CkBTCReceiveModalData } from "$lib/types/ckbtc-accounts.modal";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import {
    Modal,
    Segment,
    SegmentButton,
    Spinner,
  } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let data: CkBTCReceiveModalData;

  let universeId: UniverseCanisterId;
  let canisters: CkBTCAdditionalCanisters;
  let account: Account | undefined;
  let reload: (() => Promise<void>) | undefined;
  let canSelectAccount: boolean;

  $: ({ account, reload, canisters, universeId, canSelectAccount } = data);

  let bitcoinSegmentId = Symbol("bitcoin");
  let ckBTCSegmentId = Symbol("ckBTC");
  let selectedSegmentId: symbol;
  $: selectedSegmentId = ckBTCSegmentId;

  let modalRendered = false;
  let segment: Segment;

  const onIntroEnd = () => {
    modalRendered = true;
    segment?.initIndicator();
  };

  let bitcoin = true;
  $: bitcoin = selectedSegmentId === bitcoinSegmentId;

  let ckTESTBTC = false;
  $: ckTESTBTC = isUniverseCkTESTBTC(universeId);

  let logo: string;
  $: logo = bitcoin ? BITCOIN_LOGO : ckTESTBTC ? CKTESTBTC_LOGO : CKBTC_LOGO;

  let bitcoinSegmentLabel: string;
  $: bitcoinSegmentLabel = ckTESTBTC
    ? $i18n.ckbtc.test_bitcoin
    : $i18n.ckbtc.bitcoin;

  let tokenLabel: string;
  $: tokenLabel = bitcoin
    ? ckTESTBTC
      ? $i18n.ckbtc.test_bitcoin
      : $i18n.ckbtc.bitcoin
    : ckTESTBTC
      ? $i18n.ckbtc.test_title
      : $i18n.ckbtc.title;

  let segmentLabel: string;
  $: segmentLabel = ckTESTBTC ? $i18n.ckbtc.test_title : $i18n.ckbtc.title;

  // Avoid a UI glich by not showing the buttons until the QR Code is rendered
  let qrCodeRendered: boolean = QR_CODE_RENDERED_DEFAULT_STATE;

  const dispatcher = createEventDispatcher();

  const reloadAccountAndClose = async () => {
    startBusy({
      initiator: "reload-receive-account",
    });

    await reload?.();
    dispatcher("nnsClose");

    stopBusy("reload-receive-account");
  };

  let title: string;
  $: title = replacePlaceholders($i18n.wallet.token_address, {
    $tokenSymbol: tokenLabel,
  });

  let address: string | undefined;
  $: address = bitcoin
    ? account?.identifier !== undefined
      ? $bitcoinAddressStore[account?.identifier]
      : undefined
    : account?.identifier;

  // When used in ckBTC receive modal, the identifier is originally undefined that's why we reload when it changes
  const loadBitcoinAddress = async (
    identifier: IcrcAccountIdentifierText | undefined
  ) => {
    if (isNullish(identifier)) {
      return;
    }

    await loadBtcAddress({
      minterCanisterId: canisters.minterCanisterId,
      identifier,
    });
  };

  $: loadBitcoinAddress(account?.identifier);
</script>

<Modal testId="ckbtc-receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title"
    >{replacePlaceholders($i18n.core.receive_with_token, {
      $token: tokenLabel,
    })}</span
  >

  <div class="receive">
    <Segment bind:selectedSegmentId bind:this={segment}>
      <SegmentButton testId="receive-ckbtc" segmentId={ckBTCSegmentId}
        >{segmentLabel}</SegmentButton
      >
      <SegmentButton testId="receive-bitcoin" segmentId={bitcoinSegmentId}
        >{bitcoinSegmentLabel}</SegmentButton
      >
    </Segment>
  </div>

  <ReceiveSelectAccountDropdown
    {account}
    canSelectAccount={!bitcoin && canSelectAccount}
    {universeId}
    on:nnsSelectedAccount={({ detail }) => (account = detail)}
  />

  {#if nonNullish(address)}
    <ReceiveAddressQRCode
      {address}
      renderQRCode={modalRendered}
      qrCodeLabel={bitcoin
        ? $i18n.ckbtc.qrcode_aria_label_bitcoin
        : $i18n.ckbtc.qrcode_aria_label_ckBTC}
      {logo}
      logoArialLabel={tokenLabel}
      bind:qrCodeRendered
    >
      <svelte:fragment slot="address-label">{title}</svelte:fragment>

      <svelte:fragment slot="additional-information">
        {#if bitcoin}
          <BitcoinKYTFee {universeId} />
        {/if}
      </svelte:fragment>
    </ReceiveAddressQRCode>
  {:else}
    <div class="loading description">
      <span>{$i18n.ckbtc.loading_address}</span>
      <div><Spinner size="small" inline /></div>
    </div>
  {/if}

  <div class="toolbar">
    {#if qrCodeRendered}
      <button
        class="primary"
        on:click={reloadAccountAndClose}
        data-tid="reload-receive-account">{$i18n.core.finish}</button
      >
    {/if}
  </div>
</Modal>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .receive {
    display: flex;
    justify-content: center;
    margin-bottom: var(--padding-2x);

    --segment-width: 100%;

    @include media.min-width(medium) {
      --segment-width: fit-content;
      --segment-button-width: 200px;
    }
  }

  button.primary {
    width: 100%;
  }

  .loading {
    display: flex;
    margin: var(--padding-4x) 0;
    justify-content: center;
    align-items: center;
    gap: var(--padding);
    font-size: var(--font-size-small);

    div {
      display: flex;
    }
  }
</style>
