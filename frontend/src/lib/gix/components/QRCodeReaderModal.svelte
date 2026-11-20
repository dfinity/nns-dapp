<script lang="ts">
  import QRCodeReader from "$lib/gix/components/QRCodeReader.svelte";

  export let testId: string | undefined = undefined;

  // TODO: to be used to render a QR code in a modal until the <Modal /> component supports a minimal height for the content and automatically pushes the toolbar actions to the bottom (to be cleared with designers)
</script>

<div class="container" data-tid={testId}>
  <QRCodeReader on:nnsQRCode on:nnsQRCodeError />
</div>

<style lang="scss">
  @use "../styles/mixins/media";

  .container {
    height: 54vh;

    @include media.min-width(medium) {
      height: calc(var(--dialog-min-height) - var(--dialog-header-height));
    }
  }
</style>
