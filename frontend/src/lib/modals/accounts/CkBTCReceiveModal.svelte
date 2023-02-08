<script lang="ts">
  import {
    Copy,
    KeyValuePair,
    Modal,
    QRCode,
    Segment,
    SegmentButton,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { CkBTCWalletModalData } from "$lib/types/wallet.modal";
  import type { Account } from "$lib/types/account";
  import { SvelteComponent } from "svelte";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import BITCOIN_LOGO from "$lib/assets/bitcoin.svg";
  import Logo from "$lib/components/ui/Logo.svelte";

  export let data: CkBTCWalletModalData;

  let account: Account;
  let btcAddress: string;

  $: ({ account, btcAddress } = data);

  let bitcoinSegmentId = Symbol();
  let ckBTCSegmentId = Symbol();
  let selectedSegmentId = bitcoinSegmentId;

  let modalRendered = false;
  let segment: typeof SvelteComponent;

  const onIntroEnd = () => {
    modalRendered = true;
    segment?.initIndicator();
  };

  let logo: string;
  $: logo = selectedSegmentId === bitcoinSegmentId ? BITCOIN_LOGO : CKBTC_LOGO;

  let logoArialLabel: string;
  $: logoArialLabel = selectedSegmentId === bitcoinSegmentId ? $i18n.ckbtc.bitcoin : $i18n.ckbtc.title;
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
      {#if selectedSegmentId === bitcoinSegmentId}
        <KeyValuePair>
          <span slot="key" class="label">{$i18n.ckbtc.address}</span>
          <div slot="value" class="address">
            <span class="value">{btcAddress}</span>
            <Copy value={btcAddress} />
          </div>
        </KeyValuePair>

        <p class="description">{$i18n.ckbtc.btc_receive_note}</p>
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
          value={selectedSegmentId === bitcoinSegmentId
            ? btcAddress
            : account.identifier}
          ariaLabel={selectedSegmentId === bitcoinSegmentId
            ? $i18n.ckbtc.qrcode_aria_label_bitcoin
            : $i18n.ckbtc.qrcode_aria_label_ckBTC}
        >
          <div class="logo" slot="logo">
            <Logo src={logo} size="big" framed={false} testId="logo" alt={logoArialLabel} />
          </div>
        </QRCode>
      {/if}
    </article>
  </div>

  <div class="toolbar">
    <button class="primary" type="submit">{$i18n.core.done}</button>
  </div>
</Modal>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(large) {
      display: grid;
      grid-template-columns: repeat(2, 50%);

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
      padding: var(--padding-2x) calc(20 * var(--padding));
    }

    @include media.min-width(large) {
      padding: 0 var(--padding-4x);
    }
  }

  .description {
    margin-top: var(--padding-4x);
  }

  .receive {
    display: flex;
    justify-content: center;
    margin-bottom: var(--padding-2x);
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
