<script lang="ts">
  import { Copy, QRCode } from "@dfinity/gix-components";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { QR_CODE_RENDERED_DEFAULT_STATE } from "$lib/constants/mockable.constants";
  import { nonNullish } from "@dfinity/utils";

  export let address: string | undefined;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;
  export let logoSize: "huge" | "big" = "huge";
  // Render the QR-code when the space is available / rendered to avoid UI glitch.
  export let renderQRCode = false;

  export let qrCodeRendered: boolean = QR_CODE_RENDERED_DEFAULT_STATE;

  let addressSelected = false;
  $: addressSelected = nonNullish(address);
</script>

<div class="content">
  <article class="qrcode" class:rendered={qrCodeRendered}>
    {#if renderQRCode && addressSelected}
      <QRCode
        value={address ?? ""}
        ariaLabel={qrCodeLabel}
        on:nnsQRCodeRendered={() => (qrCodeRendered = true)}
      >
        <div class="logo" slot="logo">
          {#if qrCodeRendered}
            <Logo
              src={logo}
              size={logoSize}
              framed={false}
              testId="logo"
              alt={logoArialLabel}
            />
          {/if}
        </div>
      </QRCode>
    {/if}
  </article>

  {#if addressSelected && qrCodeRendered}
    <div class="address-block">
      <p class="label no-margin"><slot name="address-label" /></p>
      <div class="address">
        <span class="value" data-tid="qrcode-display-address">{address}</span>
        <Copy value={address ?? ""} />
      </div>

      <slot name="additional-information" />
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;

    @include media.min-width(medium) {
      gap: var(--padding-2x);
      padding: var(--padding-2x) 0;
    }
  }

  .address {
    display: flex;
    align-items: center;
    gap: var(--padding);
    margin: var(--padding-0_5x) var(--padding) 0 0;
  }

  .value {
    word-break: break-word;
  }

  .qrcode {
    margin: var(--padding) var(--padding-6x) var(--padding-2x);
    padding: var(--padding-2x);

    box-sizing: border-box;

    &.rendered {
      --qrcode-background-color: white;
    }

    background: var(--qrcode-background-color);

    width: 100%;
    max-width: 300px;

    border-radius: var(--border-radius-0_5x);

    @include media.min-width(medium) {
      margin: 0 var(--padding-2x) var(--padding);
    }
  }

  .logo {
    width: calc(10 * var(--padding));
    height: calc(10 * var(--padding));
    background: var(--qrcode-background-color);

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
  }

  .address-block {
    display: flex;
    flex-direction: column;

    margin: var(--padding) 0;

    @include media.min-width(medium) {
      --key-value-pair-justify-content: center;
    }
  }
</style>
