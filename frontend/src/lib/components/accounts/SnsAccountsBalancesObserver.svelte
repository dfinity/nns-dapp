<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import SnsBalancesObserver from "$lib/components/accounts/SnsBalancesObserver.svelte";
  import type { CanisterId } from "$lib/types/canister";

  let ledgerCanisterId: CanisterId | undefined;
  $: ledgerCanisterId = $snsProjectSelectedStore?.summary.ledgerCanisterId;
</script>

{#if nonNullish($snsOnlyProjectStore) && nonNullish(ledgerCanisterId)}
  <SnsBalancesObserver
    rootCanisterId={$snsOnlyProjectStore}
    {ledgerCanisterId}
    accounts={$snsProjectAccountsStore ?? []}
  >
    <slot />
  </SnsBalancesObserver>
{/if}
