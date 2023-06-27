<script lang="ts">
  import SnsWalletBalancesObserver from "$lib/components/accounts/SnsWalletBalancesObserver.svelte";
  import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
  import {
    ledgerCanisterIdMock,
    rootCanisterIdMock,
  } from "$tests/mocks/sns.api.mock";
</script>

<SnsWalletBalancesObserver
  account={mockSnsMainAccount}
  universeId={rootCanisterIdMock}
  ledgerCanisterId={ledgerCanisterIdMock}
>
  <div data-tid="test-observer" />
</SnsWalletBalancesObserver>
