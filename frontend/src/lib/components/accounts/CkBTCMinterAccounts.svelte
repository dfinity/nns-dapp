<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconAdd } from "@dfinity/gix-components";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { loadCkBTCAccountsMinter } from "$lib/services/ckbtc-accounts-minter.services";
  import { onMount } from "svelte";
  import { Account } from "$lib/types/account";
  import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-accounts.store";

  const reloadAccount = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      return;
    }

    await loadCkBTCAccountsMinter({
      universeId: $selectedCkBTCUniverseIdStore,
    });
  };

  // TODO do not reload, once per session
  onMount(reloadAccount);

  let accounts: Account[] = [];
  $: accounts = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCWithdrawalAccountsStore[$selectedCkBTCUniverseIdStore.toText()]
        ?.accounts ?? []
    : [];
</script>

<button class="card" data-tid="open-restart-convert-ckbtc-to-btc">
  <IconAdd />
  {$i18n.accounts.add_account}
</button>
