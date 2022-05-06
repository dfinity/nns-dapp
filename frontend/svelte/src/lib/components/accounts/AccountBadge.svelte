<script lang="ts">
  import type { Account } from "../../types/account";
  import { i18n } from "../../stores/i18n";

  export let account: Account;
</script>

<!-- No badge for main account -->

{#if account.type === "subAccount"}
  <small>{$i18n.accounts.linked_account}</small>
{:else if account.type === "hardwareWallet"}
  <small>{$i18n.accounts.hardware_wallet_account}</small>
{/if}
