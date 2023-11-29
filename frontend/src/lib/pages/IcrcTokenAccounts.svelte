<script lang="ts">
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { nonNullish } from "@dfinity/utils";
  import AccountsPage from "$lib/components/accounts/AccountsPage.svelte";

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $tokensStore[$selectedIcrcTokenUniverseIdStore.toText()]?.token
    : undefined;
</script>

<AccountsPage selectedUniverseId={$selectedIcrcTokenUniverseIdStore} {token} />
