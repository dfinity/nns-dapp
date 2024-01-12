<script lang="ts">
  import TransactionIcon from "$lib/components/accounts/TransactionIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<div class="no-transaction description" data-tid="no-transactions-component">
  <div class="transaction-icon">
    <TransactionIcon type="received" />
  </div>
  {$i18n.wallet.no_transactions}
</div>

<style lang="scss">
.no-transaction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--padding-2x);
}
</style>
