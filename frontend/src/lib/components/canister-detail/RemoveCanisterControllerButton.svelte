<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterDetailModalRemoveController } from "$lib/types/canister-detail.modal";
  import { emit } from "$lib/utils/events.utils";
  import { IconClose } from "@dfinity/gix-components";

  export let controller: string;

  const openModal = () =>
    emit<CanisterDetailModalRemoveController>({
      message: "nnsCanisterDetailModal",
      detail: { type: "remove-controller", data: { controller } },
    });
</script>

<button
  aria-label={$i18n.core.remove}
  on:click={openModal}
  data-tid="remove-canister-controller-button"
>
  <IconClose size="18px" />
</button>

<style lang="scss">
  button {
    display: flex;
  }
</style>
