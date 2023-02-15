<script lang="ts">
  import {
    busy,
    Copy,
    KeyValuePair,
    Modal,
    QRCode,
    Segment,
    SegmentButton,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import BITCOIN_LOGO from "$lib/assets/bitcoin.svg";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { updateBalance as updateBalanceService } from "$lib/services/ckbtc-minter.services";
  import { createEventDispatcher } from "svelte";
  import type { CkBTCWalletReceiveModalData } from "$lib/types/wallet.modal";

  export let data: CkBTCWalletReceiveModalData;

  let account: Account;
  let btcAddress: string;
  let reloadAccount: () => Promise<void>;

  $: ({ account, btcAddress, reloadAccount } = data);

  let bitcoinSegmentId = Symbol();
  let ckBTCSegmentId = Symbol();
  let selectedSegmentId = bitcoinSegmentId;

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
  $: logoArialLabel = bitcoin ? $i18n.ckbtc.bitcoin : $i18n.ckbtc.title;

  // Exposed for test purpose only because we are testing with jest without effectively loading the QR code
  export let qrCodeRendered = false;

  const dispatcher = createEventDispatcher();

  // TODO(GIX-1320): ckBTC - update_balance is an happy path, improve UX once track_balance implemented
  const updateBalance = async () => {
    startBusy({
      initiator: "update-ckbtc-balance",
    });

    try {
      await updateBalanceService();

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
      initiator: "reload-ckbtc-account",
    });

    await reloadAccount();
    dispatcher("nnsClose");

    stopBusy("reload-ckbtc-account");
  };
</script>

<Modal testId="ckbtc-receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  <div class="receive">
    <Segment bind:selectedSegmentId bind:this={segment}>
      <SegmentButton segmentId={bitcoinSegmentId}>Bitcoin</SegmentButton>
      <SegmentButton segmentId={ckBTCSegmentId}>ckBTC</SegmentButton>
    </Segment>
  </div>

  <div class="content">
    <div>
      {#if bitcoin}
        <KeyValuePair>
          <span slot="key" class="label">{$i18n.ckbtc.address}</span>
          <div slot="value" class="address">
            <span class="value">{btcAddress}</span>
            <Copy value={btcAddress} />
          </div>
        </KeyValuePair>
      {:else}
        <KeyValuePair>
          <span slot="key" class="label">{$i18n.ckbtc.address}</span>
          <div slot="value" class="address">
            <span class="value">{account.identifier}</span>
            <Copy value={account.identifier} />
          </div>
        </KeyValuePair>
      {/if}
    </div>

    <article class="qrcode">
      {#if modalRendered}
        <QRCode
          value={bitcoin ? btcAddress : account.identifier}
          ariaLabel={bitcoin
            ? $i18n.ckbtc.qrcode_aria_label_bitcoin
            : $i18n.ckbtc.qrcode_aria_label_ckBTC}
          on:nnsQRCodeRendered={() => (qrCodeRendered = true)}
        >
          <div class="logo" slot="logo">
            <Logo
              src={logo}
              size="huge"
              framed={false}
              testId="logo"
              alt={logoArialLabel}
            />
          </div>
        </QRCode>
      {/if}
    </article>

    <p class="description">
      {bitcoin ? $i18n.ckbtc.btc_receive_note : $i18n.ckbtc.ckbtc_receive_note}
    </p>
  </div>

  <div class="toolbar">
    {#if qrCodeRendered}
      {#if bitcoin}
        <button
          class="primary"
          on:click={updateBalance}
          disabled={$busy}
          data-tid="update-ckbtc-balance">{$i18n.core.done}</button
        >
      {:else}
        <button
          class="primary"
          on:click={reloadAccountAndClose}
          data-tid="reload-ckbtc-account">{$i18n.core.done}</button
        >
      {/if}
    {/if}
  </div>
</Modal>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(medium) {
      display: grid;
      grid-template-columns: repeat(2, 50%);
      grid-template-rows: auto 1fr;
      grid-row-gap: var(--padding-4x);

      padding: var(--padding-2x) 0;
    }
  }

  .address {
    display: flex;
  }

  .value {
    word-break: break-word;
    margin-top: 4px;
  }

  .qrcode {
    padding: var(--padding-2x) var(--padding-8x);

    @include media.min-width(medium) {
      grid-column: 2 / 3;
      grid-row: 1 / 3;

      padding: 0 var(--padding-4x);
    }
  }

  .description {
    @include media.min-width(medium) {
      grid-column: 1 / 2;
      margin-top: 0;
    }
  }

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

  .logo {
    width: calc(10 * var(--padding));
    height: calc(10 * var(--padding));
    background: var(--overlay-content-background);

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
  }
</style>
