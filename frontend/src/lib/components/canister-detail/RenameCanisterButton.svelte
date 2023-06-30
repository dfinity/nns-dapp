<script lang="ts">
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { emit } from "$lib/utils/events.utils";
  import type { CanisterDetailModal } from "$lib/types/canister-detail.modal";

  const openModal = () =>
    emit<CanisterDetailModal>({
      message: "nnsCanisterDetailModal",
      detail: { type: "rename" },
    });
</script>

<button
  class="secondary"
  type="button"
  on:click={openModal}
  disabled={$busy}
  data-tid="rename-canister-button-component"
>
  {$i18n.canister_detail.rename}
</button>
