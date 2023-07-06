<script lang="ts">
  import SnsBalancesObserver from "$lib/components/accounts/SnsBalancesObserver.svelte";
  import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
  import {
    ledgerCanisterIdMock,
    rootCanisterIdMock,
  } from "$tests/mocks/sns.api.mock";
</script>

<SnsBalancesObserver
  accounts={[mockSnsMainAccount]}
  rootCanisterId={rootCanisterIdMock}
  ledgerCanisterId={ledgerCanisterIdMock}
>
  <div data-tid="test-observer" />
</SnsBalancesObserver>
