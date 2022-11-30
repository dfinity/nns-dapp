<script lang="ts">
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { emit } from "$lib/utils/events.utils";
  import type { CanisterDetailsModalDetach } from "$lib/types/canister-detail.modal";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;

  const openModal = () =>
    emit<CanisterDetailsModalDetach>({
      message: "nnsCanisterDetailModal",
      detail: { type: "detach", data: { canisterId } },
    });
</script>

<button
  class="primary"
  type="button"
  on:click={openModal}
  disabled={$busy}
  data-tid="detach-canister-button"
>
  {$i18n.canister_detail.detach}
</button>
