<script lang="ts">
  import type { Account } from "../../types/account";
  import { i18n } from "../../stores/i18n";

  export let account: Account;
</script>

<!-- No badge for main account -->

{#if account.subAccount !== undefined}
  <small>{$i18n.accounts.linked_account}</small>
{/if}
