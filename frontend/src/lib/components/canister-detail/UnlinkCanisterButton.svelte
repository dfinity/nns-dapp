<script lang="ts">
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { emit } from "$lib/utils/events.utils";
  import type { CanisterDetailModalDetach } from "$lib/types/canister-detail.modal";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;

  const openModal = () =>
    emit<CanisterDetailModalDetach>({
      message: "nnsCanisterDetailModal",
      detail: { type: "unlink", data: { canisterId } },
    });
</script>

<button
  class="primary"
  type="button"
  on:click={openModal}
  disabled={$busy}
  data-tid="unlink-canister-button"
>
  {$i18n.canister_detail.unlink}
</button>
