<script lang="ts">
  import type { CanisterId } from "$lib/types/canister";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { Account } from "$lib/types/account";
  import type { TransactionsObserverData } from "$lib/types/icrc.observer";
  import IcrcTransactionsObserver from "$lib/components/accounts/IcrcTransactionsObserver.svelte";
  import type { TransactionsCallback } from "$lib/services/worker-transactions.services";
  import { isNullish } from "@dfinity/utils";
  import { addObservedIcrcTransactionsToStore } from "$lib/services/observer.services";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;
  export let completed: boolean;

  let data: TransactionsObserverData;
  $: data = {
    account,
    indexCanisterId: indexCanisterId.toText(),
  };

  const callback: TransactionsCallback = ({ transactions }) => {
    if (isNullish(universeId)) {
      // With current usage, can unlikely be undefined here
      return;
    }

    addObservedIcrcTransactionsToStore({
      universeId,
      completed,
      transactions,
    });
  };
</script>

<IcrcTransactionsObserver {data} {callback}>
  <slot />
</IcrcTransactionsObserver>
