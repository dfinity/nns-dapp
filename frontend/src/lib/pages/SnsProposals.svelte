<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
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

  onMount(async () => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        await Promise.all([
          loadSnsProposals({ rootCanisterId: selectedProjectCanisterId }),
          loadSnsNervousSystemFunctions(selectedProjectCanisterId),
          loadSnsFilters(selectedProjectCanisterId),
        ]);
      }
    }
  );

  onDestroy(unsubscribe);

  let loadingNextPage = false;
  let loadNextPage: () => void;
  $: loadNextPage = async () => {
    const selectedProjectCanisterId = $snsOnlyProjectStore;
    if (selectedProjectCanisterId !== undefined) {
      const beforeProposalId =
        proposals !== undefined ? lastProposalId(proposals) : undefined;
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
  $: proposals =
    $snsOnlyProjectStore !== undefined
      ? sortSnsProposalsById(
          $snsProposalsStore[$snsOnlyProjectStore.toText()]?.proposals
        )
      : undefined;

  let nsFunctions: SnsNervousSystemFunction[] | undefined;
  $: nsFunctions =
    $snsOnlyProjectStore !== undefined
      ? $snsFunctionsStore[$snsOnlyProjectStore.toText()]?.nsFunctions
      : undefined;

  let disableInfiniteScroll: boolean;
  $: disableInfiniteScroll =
    $snsOnlyProjectStore !== undefined
      ? $snsProposalsStore[$snsOnlyProjectStore.toText()]?.completed ?? false
      : false;
</script>

<SnsProposalsList
  {proposals}
  {nsFunctions}
  on:nnsIntersect={loadNextPage}
  {disableInfiniteScroll}
  {loadingNextPage}
/>
