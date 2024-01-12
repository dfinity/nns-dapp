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
  import {
    loadSnsFilters,
    updateSnsTypeFilter,
  } from "$lib/services/sns-filters.services";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import {
    snsFiltersStore,
    type SnsFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
  import type { Principal } from "@dfinity/principal";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import type { Readable } from "svelte/store";

  let currentProjectCanisterId: Principal | undefined = undefined;
  const onSnsProjectChanged = async ({
    rootCanisterId,
    snsName,
  }: {
    rootCanisterId: Principal | undefined;
    snsName: string;
  }) => {
    currentProjectCanisterId = rootCanisterId;
    if (nonNullish(rootCanisterId)) {
      await Promise.all([
        loadSnsNervousSystemFunctions(rootCanisterId),
        loadSnsFilters(rootCanisterId),
      ]);
      // The store should be updated at this point. But in case it's not (errors etc.),
      // we shouldn't update the filter.
      if (isNullish($nsFunctionsStore)) {
        throw new Error("no nsFunctions");
      }
      updateSnsTypeFilter({
        rootCanisterId,
        nsFunctions: $nsFunctionsStore,
        snsName,
      });
    }
  };

  $: if (nonNullish($snsProjectSelectedStore?.summary?.metadata?.name)) {
    onSnsProjectChanged({
      rootCanisterId: $snsOnlyProjectStore,
      snsName: $snsProjectSelectedStore?.summary.metadata.name ?? "",
    });
  }

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
