<script lang="ts">
  import TransactionCard from "./TransactionCard.svelte";
  import type { UiTransaction } from "$lib/types/transaction";
  import { nonNullish } from "@dfinity/utils";

  export let transaction: UiTransaction | undefined;
</script>

{#if nonNullish(transaction)}
  <TransactionCard {transaction} />
{/if}
