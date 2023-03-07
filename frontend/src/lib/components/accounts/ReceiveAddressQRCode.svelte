<script lang="ts">
  import { Copy, KeyValuePair, QRCode } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { fade } from "svelte/transition";

  export let address: string;
  export let renderQRCode = false;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;

  // Exposed for test purpose only because we are testing with jest without effectively loading the QR code
  export let qrCodeRendered = false;
</script>

<div class="content">
  <div>
    <KeyValuePair>
      <span slot="key" class="label">{$i18n.accounts.address}</span>
      <div slot="value" class="address">
        <span class="value">{address}</span>
        <Copy value={address} />
      </div>
    </KeyValuePair>
  </div>

  <article class="qrcode">
    {#if renderQRCode}
      <QRCode
        value={address}
        ariaLabel={qrCodeLabel}
        on:nnsQRCodeRendered={() => (qrCodeRendered = true)}
      >
        <div class="logo" slot="logo" in:fade={{ duration: 200 }}>
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
    <slot name="description" />
  </p>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

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
