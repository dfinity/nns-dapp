<script lang="ts">
  import { busy, Modal, Segment, SegmentButton } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import BITCOIN_LOGO from "$lib/assets/bitcoin.svg";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { updateBalance as updateBalanceService } from "$lib/services/ckbtc-minter.services";
  import { createEventDispatcher } from "svelte";
  import type { CkBTCWalletBtcCkBTCReceiveModalData } from "$lib/types/wallet.modal";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import { nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { QR_CODE_RENDERED } from "$lib/constants/environment.constants";

  export let data: CkBTCWalletBtcCkBTCReceiveModalData;

  let universeId: UniverseCanisterId;
  let canisters: CkBTCAdditionalCanisters;
  let account: Account;
  let btcAddress: string;
  let reloadAccount: () => Promise<void>;
  let displayBtcAddress: boolean;

  $: ({
    account,
    btcAddress,
    reloadAccount,
    canisters,
    universeId,
    displayBtcAddress,
  } = data);

  let bitcoinSegmentId = Symbol("bitcoin");
  let ckBTCSegmentId = Symbol("ckBTC");
  let selectedSegmentId: symbol;
  $: selectedSegmentId = displayBtcAddress ? bitcoinSegmentId : ckBTCSegmentId;

  let modalRendered = false;
  let segment: Segment;

  const onIntroEnd = () => {
    modalRendered = true;
    segment?.initIndicator();
  };

  let bitcoin = true;
  $: bitcoin = selectedSegmentId === bitcoinSegmentId;

  let logo: string;
  $: logo = bitcoin ? BITCOIN_LOGO : CKBTC_LOGO;

  let logoArialLabel: string;
  $: logoArialLabel = bitcoin
    ? $i18n.ckbtc.bitcoin
    : isUniverseCkTESTBTC(universeId)
    ? $i18n.ckbtc.test_title
    : $i18n.ckbtc.title;

  let segmentLabel: string;
  $: segmentLabel = isUniverseCkTESTBTC(universeId)
    ? $i18n.ckbtc.test_title
    : $i18n.ckbtc.title;

  let qrCodeRendered = QR_CODE_RENDERED;

  const dispatcher = createEventDispatcher();

  // TODO(GIX-1320): ckBTC - update_balance is an happy path, improve UX once track_balance implemented
  const updateBalance = async () => {
    startBusy({
      initiator: "update-ckbtc-balance",
    });

    try {
      await updateBalanceService(canisters.minterCanisterId);

      await reloadAccount();

      toastsSuccess({
        labelKey: "ckbtc.ckbtc_balance_updated",
      });

      dispatcher("nnsClose");
    } catch (err: unknown) {
      toastsError({
        labelKey: "error__ckbtc.update_balance",
        err,
      });
    }

    stopBusy("update-ckbtc-balance");
  };

  const reloadAccountAndClose = async () => {
    startBusy({
      initiator: "reload-receive-account",
    });

    await reloadAccount();
    dispatcher("nnsClose");

    stopBusy("reload-receive-account");
  };

  // TODO: to be removed when ckBTC with minter is live.
  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenStore[universeId.toText()]
    : undefined;

  let title: string;
  $: title =
    !displayBtcAddress && nonNullish(token)
      ? replacePlaceholders($i18n.wallet.sns_receive_note_title, {
          $tokenSymbol: token.token.symbol,
        })
      : bitcoin
      ? $i18n.ckbtc.btc_receive_note_title
      : $i18n.ckbtc.ckbtc_receive_note_title;

  let description: string;
  $: description =
    !displayBtcAddress && nonNullish(token)
      ? replacePlaceholders($i18n.wallet.sns_receive_note_text, {
          $tokenSymbol: token.token.symbol,
        })
      : bitcoin
      ? $i18n.ckbtc.btc_receive_note_text
      : $i18n.ckbtc.ckbtc_receive_note_text;
</script>

<Modal testId="ckbtc-receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  {#if displayBtcAddress}
    <div class="receive">
      <Segment bind:selectedSegmentId bind:this={segment}>
        <SegmentButton segmentId={bitcoinSegmentId}
          >{$i18n.ckbtc.bitcoin}</SegmentButton
        >
        <SegmentButton segmentId={ckBTCSegmentId}>{segmentLabel}</SegmentButton>
      </Segment>
    </div>
  {/if}

  <ReceiveAddressQRCode
    address={bitcoin ? btcAddress : account.identifier}
    renderQRCode={modalRendered}
    qrCodeLabel={bitcoin
      ? $i18n.ckbtc.qrcode_aria_label_bitcoin
      : $i18n.ckbtc.qrcode_aria_label_ckBTC}
    {logo}
    {logoArialLabel}
    bind:qrCodeRendered
  >
    <svelte:fragment slot="title">{title}</svelte:fragment>
    <svelte:fragment slot="description">{description}</svelte:fragment>
  </ReceiveAddressQRCode>

  <div class="toolbar">
    {#if qrCodeRendered}
      {#if bitcoin}
        <button
          class="primary"
          on:click={updateBalance}
          disabled={$busy}
          data-tid="update-ckbtc-balance">{$i18n.core.finish}</button
        >
      {:else}
        <button
          class="primary"
          on:click={reloadAccountAndClose}
          data-tid="reload-receive-account">{$i18n.core.finish}</button
        >
      {/if}
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
</style>
