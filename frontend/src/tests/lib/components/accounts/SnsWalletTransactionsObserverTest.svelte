<script lang="ts">
  import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
  import SnsWalletTransactionsObserver from "$lib/components/accounts/SnsWalletTransactionsObserver.svelte";
</script>

<SnsWalletTransactionsObserver account={mockSnsMainAccount} completed={true}>
  <div data-tid="test-observer" />
</SnsWalletTransactionsObserver>
