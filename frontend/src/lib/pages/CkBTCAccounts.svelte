<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import CkBTCWithdrawalAccount from "$lib/components/accounts/CkBTCWithdrawalAccount.svelte";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import { loadCkBTCInfo } from "$lib/services/ckbtc-info.services";
  import IcrcAccountsPage from "$lib/components/accounts/IcrcAccountsPage.svelte";

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  $: (async () =>
    await loadCkBTCInfo({
      universeId: $selectedCkBTCUniverseIdStore,
      minterCanisterId: canisters?.minterCanisterId,
    }))();
</script>

<IcrcAccountsPage
  testId="ckbtc-accounts-body"
  selectedUniverseId={$selectedCkBTCUniverseIdStore}
  token={token?.token}
>
  <CkBTCWithdrawalAccount slot="additional-accounts" />
</IcrcAccountsPage>
