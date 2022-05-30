<script lang="ts">
  import RenameSubAccountModal from "../../modals/accounts/RenameSubAccountModal.svelte";
  import { i18n } from "../../stores/i18n";

  let modalOpen = false;
</script>

<button
  class="primary small"
  type="button"
  on:click={() => (modalOpen = true)}
  data-tid="open-rename-subaccount-button"
>
  {$i18n.accounts.rename}
</button>

{#if modalOpen}
  <RenameSubAccountModal on:nnsClose={() => (modalOpen = false)} />
{/if}
