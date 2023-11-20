<script lang="ts">
  import { loadSnsProposals } from "$lib/services/$public/sns-proposals.services";
  import type { SnsProposalData } from "@dfinity/sns";
  import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
  import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
  import {
    lastProposalId,
    sortSnsProposalsById,
  } from "$lib/utils/sns-proposals.utils";
  import { loadSnsFilters } from "$lib/services/sns-filters.services";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import {
    snsFiltersStore,
    type SnsFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import { nonNullish } from "@dfinity/utils";
  import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
  import type { Principal } from "@dfinity/principal";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import type { Readable } from "svelte/store";

  let currentProjectCanisterId: Principal | undefined = undefined;
  let functionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  const onSnsProjectChanged = async (
    selectedProjectCanisterId: Principal | undefined
  ) => {
    currentProjectCanisterId = selectedProjectCanisterId;
    if (nonNullish(selectedProjectCanisterId)) {
      functionsStore = createSnsNsFunctionsProjectStore(
        currentProjectCanisterId
      );
      await loadSnsNervousSystemFunctions(selectedProjectCanisterId);
    }
  };
  $: if (
    currentProjectCanisterId !== undefined &&
    $functionsStore !== undefined
  ) {
    loadSnsFilters({
      rootCanisterId: currentProjectCanisterId,
      snsFunctions: $functionsStore,
    });
  }

  $: onSnsProjectChanged($snsOnlyProjectStore);

  const fetchProposals = async (filters: SnsFiltersStoreData) => {
    // First call will have `filters` as `undefined`.
    // Once we have the initial filters, we load the proposals.
    if (
      nonNullish(currentProjectCanisterId) &&
      nonNullish(filters[currentProjectCanisterId.toText()]) &&
      nonNullish($functionsStore)
    ) {
      await loadSnsProposals({
        rootCanisterId: currentProjectCanisterId,
        snsFunctions: $functionsStore,
      });
    }
  };

  // Fetch the proposals only on filters or project change.
  // TODO(e2e): cover this with e2e tests.
  $: $snsOnlyProjectStore,
    $snsFiltersStore,
    $functionsStore,
    (() => fetchProposals($snsFiltersStore))();

  let loadingNextPage = false;
  let loadNextPage: () => void;
  $: loadNextPage = async () => {
    const selectedProjectCanisterId = $snsOnlyProjectStore;
    if (
      selectedProjectCanisterId !== undefined &&
      nonNullish($functionsStore)
    ) {
      const beforeProposalId = nonNullish(currentProjectCanisterId)
        ? lastProposalId(
            $snsProposalsStore[currentProjectCanisterId.toText()]?.proposals ??
              []
          )
        : undefined;

      loadingNextPage = true;
      await loadSnsProposals({
        rootCanisterId: selectedProjectCanisterId,
        snsFunctions: $functionsStore,
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

  let nsFunctionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: nsFunctionsStore = createSnsNsFunctionsProjectStore(
    currentProjectCanisterId
  );

  let disableInfiniteScroll: boolean;
  $: disableInfiniteScroll = nonNullish(currentProjectCanisterId)
    ? $snsProposalsStore[currentProjectCanisterId.toText()]?.completed ?? false
    : false;
</script>

<SnsProposalsList
  {proposals}
  nsFunctions={$nsFunctionsStore}
  on:nnsIntersect={loadNextPage}
  {disableInfiniteScroll}
  {loadingNextPage}
/>
