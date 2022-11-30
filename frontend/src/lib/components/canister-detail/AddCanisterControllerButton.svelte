<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { emit } from "$lib/utils/events.utils";
  import type { CanisterDetailModal } from "$lib/types/canister-detail.modal";

  const openModal = () =>
    emit<CanisterDetailModal>({
      message: "nnsCanisterDetailModal",
      detail: { type: "add-controller" },
    });
</script>

<button
  data-tid="add-canister-controller-button"
  on:click={openModal}
  class="primary">{$i18n.canister_detail.add_controller}</button
>
