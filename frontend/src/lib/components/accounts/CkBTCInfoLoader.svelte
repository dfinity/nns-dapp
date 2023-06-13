<script lang="ts">
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { loadCkBTCInfo } from "$lib/services/ckbtc-info.services";

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  const loadInfo = async ({
    selectedCkBTCUniverseId,
    canisters,
  }: {
    selectedCkBTCUniverseId: UniverseCanisterId | undefined;
    canisters: Partial<CkBTCAdditionalCanisters>;
  }) => {
    // Do nothing when the universe is not ckBTC
    if (isNullish(selectedCkBTCUniverseId)) {
      return;
    }

    // We do not throw an error here if the minter canister ID is not defined. It's up to the features that uses ckBTCInfoStore to properly handle undefined values
    if (isNullish(canisters) || isNullish(canisters.minterCanisterId)) {
      return;
    }

    await loadCkBTCInfo({
      universeId: selectedCkBTCUniverseId,
      minterCanisterId: canisters.minterCanisterId,
    });
  };

  $: (async () =>
    loadInfo({
      selectedCkBTCUniverseId: $selectedCkBTCUniverseIdStore,
      canisters,
    }))();
</script>

<slot />
