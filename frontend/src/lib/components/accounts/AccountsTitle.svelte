<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import AccountsBalance from "$lib/components/accounts/AccountsBalance.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";

  export let balance: TokenAmount | undefined;
</script>

<SummaryUniverse>
  <AccountsBalance {balance} />
</SummaryUniverse>
