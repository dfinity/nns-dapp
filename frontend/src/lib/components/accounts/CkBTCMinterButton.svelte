<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconAdd } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { loadCkBTCAccountsMinter } from "$lib/services/ckbtc-accounts-minter.services";
  import { onMount } from "svelte";

  const reloadAccount = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      return;
    }

    await loadCkBTCAccountsMinter({
      universeId: $selectedCkBTCUniverseIdStore,
    });
  };

  // TODO according store

  onMount(reloadAccount);
</script>

<button class="card" data-tid="open-restart-convert-ckbtc-to-btc">
  <IconAdd />
  {$i18n.accounts.add_account}
</button>
