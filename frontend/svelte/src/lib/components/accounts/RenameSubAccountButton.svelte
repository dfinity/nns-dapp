<script lang="ts">
  import RenameSubAccountModal from "../../modals/accounts/RenameSubAccountModal.svelte";
  import type { Account } from "../../types/account";
  import { i18n } from "../../stores/i18n";

  export let selectedAccount: Account | undefined;

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
  <RenameSubAccountModal
    {selectedAccount}
    on:nnsClose={() => (modalOpen = false)}
  />
{/if}
