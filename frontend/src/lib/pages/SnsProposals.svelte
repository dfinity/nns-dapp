<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { loadSnsProposals } from "$lib/services/$public/sns-proposals.services";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import type { SnsProposalData } from "@dfinity/sns";
  import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
  import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
  import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
  import {
    lastProposalId,
    sortSnsProposalsById,
  } from "$lib/utils/sns-proposals.utils";
  import { loadSnsFilters } from "$lib/services/sns-filters.services";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";
  import {
    snsFiltersStore,
    type SnsFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import { nonNullish } from "@dfinity/utils";
  import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
  import type { Principal } from "@dfinity/principal";

  onMount(async () => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!$ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });

  let currentProjectCanisterId: Principal | undefined = undefined;
  const onSnsProjectChanged = async (
    selectedProjectCanisterId: Principal | undefined
  ) => {
    currentProjectCanisterId = selectedProjectCanisterId;
    if (nonNullish(selectedProjectCanisterId)) {
      await Promise.all([
        loadSnsNervousSystemFunctions(selectedProjectCanisterId),
        loadSnsFilters(selectedProjectCanisterId),
      ]);
    }
  };

  $: onSnsProjectChanged($snsOnlyProjectStore);

  const fetchProposals = async (filters: SnsFiltersStoreData) => {
    // First call will have `filters` as `undefined`.
    // Once we have the initial filters, we load the proposals.
    if (
      nonNullish(currentProjectCanisterId) &&
      nonNullish(filters[currentProjectCanisterId.toText()])
    ) {
      await loadSnsProposals({ rootCanisterId: currentProjectCanisterId });
    }
  };

  // Fetch the proposals only on filters or project change.
  // TODO(e2e): cover this with e2e tests.
  $: $snsOnlyProjectStore,
    $snsFiltersStore,
    (() => fetchProposals($snsFiltersStore))();

  let loadingNextPage = false;
  let loadNextPage: () => void;
  $: loadNextPage = async () => {
    const selectedProjectCanisterId = $snsOnlyProjectStore;
    if (selectedProjectCanisterId !== undefined) {
      const beforeProposalId = nonNullish(currentProjectCanisterId)
        ? lastProposalId(
            $snsProposalsStore[currentProjectCanisterId.toText()]?.proposals ??
              []
          )
        : undefined;

      loadingNextPage = true;
      await loadSnsProposals({
        rootCanisterId: selectedProjectCanisterId,
        beforeProposalId,
      });
      loadingNextPage = false;
    }
  };

  // `undefined` means that we haven't loaded the proposals yet.
  let proposals: SnsProposalData[] | undefined;
  $: proposals = nonNullish(currentProjectCanisterId)
    ? sortSnsProposalsById(
        $snsFilteredProposalsStore[currentProjectCanisterId.toText()]?.proposals
      )
    : undefined;

  let nsFunctions: SnsNervousSystemFunction[] | undefined;
  $: nsFunctions = nonNullish(currentProjectCanisterId)
    ? $snsFunctionsStore[currentProjectCanisterId.toText()]?.nsFunctions
    : undefined;

  let disableInfiniteScroll: boolean;
  $: disableInfiniteScroll = nonNullish(currentProjectCanisterId)
    ? $snsProposalsStore[currentProjectCanisterId.toText()]?.completed ?? false
    : false;
</script>

<SnsProposalsList
  {proposals}
  {nsFunctions}
  on:nnsIntersect={loadNextPage}
  {disableInfiniteScroll}
  {loadingNextPage}
/>
