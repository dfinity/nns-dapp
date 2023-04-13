<script lang="ts">
  import BitcoinFeeDisplay from "$lib/components/accounts/BitcoinFeeDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let testId: string | undefined = undefined;
  export let fee: bigint | undefined | null = undefined;
</script>

<BitcoinFeeDisplay {fee} {testId}>
  {$i18n.accounts.estimated_bitcoin_transaction_fee}
</BitcoinFeeDisplay>
