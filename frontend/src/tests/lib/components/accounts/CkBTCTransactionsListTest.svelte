<script lang="ts">
  import type { CanisterId } from "$lib/types/canister";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { Account } from "$lib/types/account";
  import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
  import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;

  export const reloadAccount = () => (account = { ...account });
</script>

<CkBTCTransactionsList
  {indexCanisterId}
  {universeId}
  {account}
  token={mockCkBTCToken}
/>
