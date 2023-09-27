<script lang="ts">
  import { canShare, shareFile } from "$lib/utils/share.utils";
  import { isNullish } from "@dfinity/utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { canvasToBlob } from "$lib/utils/canvas.utils";

  export let address: string | undefined;

  // TODO: labels
  const share = async () => {
    if (isNullish(address)) {
      toastsError({
        labelKey: "error__attach_wallet.no_identity",
      });
      return;
    }

    const canvas: HTMLCanvasElement | null =
      document.querySelector(".qrcode canvas");

    if (isNullish(canvas)) {
      toastsError({
        labelKey: "error__attach_wallet.no_identity",
      });
      return;
    }

    const blob = await canvasToBlob({ canvas, type: "image/png" });

    if (isNullish(blob)) {
      // Cannot convert QR code to an image.
      toastsError({
        labelKey: "error__attach_wallet.no_identity",
      });
      return;
    }

    await shareFile({
      file: new File([blob], `Address ${new Date().toLocaleString()}.png`, {
        type: "image/png",
        lastModified: new Date().getTime(),
      }),
      text: address,
    });
  };

  const shareAvailable = canShare();
</script>

{#if shareAvailable}
  <button class="secondary" on:click={share} style="flex: 1">Share</button>
{/if}
