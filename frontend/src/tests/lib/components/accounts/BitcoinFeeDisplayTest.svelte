<script lang="ts">
  import BitcoinFeeDisplay from "$lib/components/accounts/BitcoinFeeDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let fee: bigint | undefined | null = undefined;
</script>

<BitcoinFeeDisplay {fee}>
  {$i18n.accounts.estimated_bitcoin_transaction_fee}
</BitcoinFeeDisplay>
