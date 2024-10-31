<script lang="ts">
  import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import {
    snsFilteredActionableProposalsStore,
    type SnsProposalActionableData,
  } from "$lib/derived/sns/sns-filtered-actionable-proposals.derived";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import { loadSnsProposals } from "$lib/services/public/sns-proposals.services";
  import { loadSnsFilters } from "$lib/services/sns-filters.services";
  import {
    actionableSnsProposalsStore,
    type ActionableSnsProposalsData,
  } from "$lib/stores/actionable-sns-proposals.store";
  import {
    snsFiltersStore,
    type SnsFiltersStoreData,
  } from "$lib/stores/sns-filters.store";
  import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
  import {
    lastProposalId,
    sortSnsProposalsById,
  } from "$lib/utils/sns-proposals.utils";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { Readable } from "svelte/store";

  let nsFunctionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: nsFunctionsStore = createSnsNsFunctionsProjectStore($snsOnlyProjectStore);

  let snsName: string | undefined;
  $: snsName = $snsProjectSelectedStore?.summary?.metadata?.name;

  let currentProjectCanisterId: Principal | undefined = undefined;
  const onSnsProjectChanged = async ({
    rootCanisterId,
    snsName,
  }: {
    rootCanisterId: Principal | undefined;
    snsName: string;
  }) => {
    if (isNullish(rootCanisterId) || isNullish(snsName)) {
      return;
    }

    currentProjectCanisterId = rootCanisterId;
    // The store should be updated at this point. But in case it's not (errors etc.),
    // we shouldn't update the filter.
    if (isNullish($nsFunctionsStore)) {
      throw new Error("no nsFunctions");
    }

    await loadSnsFilters({
      rootCanisterId,
      nsFunctions: $nsFunctionsStore,
      snsName,
    });
  };

  $: onSnsProjectChanged({
    rootCanisterId: $snsOnlyProjectStore,
    snsName: snsName ?? "",
  });

  const fetchProposals = async (filters: SnsFiltersStoreData) => {
    // First call will have `filters` as `undefined`.
    // Once we have the initial filters, we load the proposals.
    if (
      nonNullish(currentProjectCanisterId) &&
      nonNullish(filters[currentProjectCanisterId.toText()]) &&
      nonNullish($nsFunctionsStore)
    ) {
      await loadSnsProposals({
        rootCanisterId: currentProjectCanisterId,
        snsFunctions: $nsFunctionsStore,
      });
    }
  };

  // Fetch the proposals only on filters or project change.
  // TODO(e2e): cover this with e2e tests.
  $: $snsOnlyProjectStore,
    $snsFiltersStore,
    $nsFunctionsStore,
    (() => fetchProposals($snsFiltersStore))();

  let loadingNextPage = false;
  let loadNextPage: () => void;
  $: loadNextPage = async () => {
    const selectedProjectCanisterId = $snsOnlyProjectStore;
    if (
      selectedProjectCanisterId !== undefined &&
      nonNullish($nsFunctionsStore)
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
        snsFunctions: $nsFunctionsStore,
        beforeProposalId,
      });
      loadingNextPage = false;
    }
  };

  let actionableProposalsData: ActionableSnsProposalsData | undefined;
  $: actionableProposalsData = nonNullish(currentProjectCanisterId)
    ? $actionableSnsProposalsStore[currentProjectCanisterId.toText()]
    : undefined;
  let actionableProposals: SnsProposalActionableData[] | undefined;
  $: actionableProposals = actionableProposalsData?.proposals.map(
    (proposal) =>
      ({
        ...proposal,
        isActionable: true,
      }) as SnsProposalActionableData
  );

  // `undefined` means that we haven't loaded the proposals yet.
  let proposals: SnsProposalActionableData[] | undefined;
  $: proposals = nonNullish(currentProjectCanisterId)
    ? sortSnsProposalsById(
        $actionableProposalsActiveStore
          ? actionableProposals
          : $snsFilteredActionableProposalsStore[
              currentProjectCanisterId.toText()
            ]
      )
    : undefined;

  let disableInfiniteScroll: boolean;
  $: disableInfiniteScroll = nonNullish(currentProjectCanisterId)
    ? ($snsProposalsStore[currentProjectCanisterId.toText()]?.completed ??
      false)
    : false;
</script>

{#if nonNullish(snsName)}
  <SnsProposalsList
    {proposals}
    actionableSelected={$actionableProposalsActiveStore}
    nsFunctions={$nsFunctionsStore}
    on:nnsIntersect={loadNextPage}
    {disableInfiniteScroll}
    {loadingNextPage}
  />
{/if}
