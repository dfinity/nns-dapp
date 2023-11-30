<script lang="ts">
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { nonNullish } from "@dfinity/utils";
  import IcrcAccountsPage from "$lib/components/accounts/IcrcAccountsPage.svelte";

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $tokensStore[$selectedIcrcTokenUniverseIdStore.toText()]?.token
    : undefined;
</script>

<IcrcAccountsPage
  testId="icrc-accounts-body"
  selectedUniverseId={$selectedIcrcTokenUniverseIdStore}
  {token}
/>
