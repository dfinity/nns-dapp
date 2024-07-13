<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterDetailModal } from "$lib/types/canister-detail.modal";
  import { emit } from "$lib/utils/events.utils";
  import { busy } from "@dfinity/gix-components";

  const openModal = () => {
    emit<CanisterDetailModal>({
      message: "nnsCanisterDetailModal",
      detail: { type: "rename" },
    });
  };
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
