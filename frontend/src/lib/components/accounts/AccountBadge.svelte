<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";

  export let account: Account;
</script>

<!-- No badge for main account -->
{#if account.type !== "main"}
  <small class="label">{$i18n.accounts[account.type]}</small>
{/if}
