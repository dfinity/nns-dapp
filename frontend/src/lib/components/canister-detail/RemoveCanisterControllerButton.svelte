<script lang="ts">
  import { IconClose } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { emit } from "$lib/utils/events.utils";
  import type { CanisterDetailsModalRemoveController } from "$lib/types/canister-detail.modal";

  export let controller: string;

  const openModal = () =>
    emit<CanisterDetailsModalRemoveController>({
      message: "nnsCanisterDetailModal",
      detail: { type: "remove-controller", detail: { controller } },
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
