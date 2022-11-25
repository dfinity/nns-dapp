<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { walletModal } from "$lib/stores/modal.store";
</script>

<button
  class="secondary"
  type="button"
  on:click={() => walletModal.set("rename")}
  data-tid="open-rename-subaccount-button"
>
  {$i18n.accounts.rename}
</button>
