<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openWalletModal } from "$lib/utils/modals.utils";
</script>

<button
  class="secondary"
  type="button"
  on:click={() => openWalletModal({ type: "rename" })}
  data-tid="open-rename-subaccount-button"
>
  {$i18n.accounts.rename}
</button>
