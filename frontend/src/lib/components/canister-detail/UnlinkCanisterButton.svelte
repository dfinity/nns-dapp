<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { CanisterDetailModalDetach } from "$lib/types/canister-detail.modal";
  import { emit } from "$lib/utils/events.utils";
  import { busy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;

  const openModal = () =>
    emit<CanisterDetailModalDetach>({
      message: "nnsCanisterDetailModal",
      detail: { type: "unlink", data: { canisterId } },
    });
</script>

<button
  class="secondary"
  type="button"
  on:click={openModal}
  disabled={$busy}
  data-tid="unlink-canister-button"
>
  {$i18n.canister_detail.unlink}
</button>
