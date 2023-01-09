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
  import { i18n } from "$lib/stores/i18n";
  import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
  import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { fromNullable } from "@dfinity/utils";

  onMount(async () => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }));
    }
  });

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        await Promise.all([
          loadSnsProposals({ rootCanisterId: selectedProjectCanisterId }),
          loadSnsNervousSystemFunctions(selectedProjectCanisterId),
        ]);
      }
    }
  );

  onDestroy(unsubscribe);

  // `undefined` means that we haven't loaded the proposals yet.
  let proposals: SnsProposalData[] | undefined;
  $: proposals =
    $snsOnlyProjectStore !== undefined
      ? $snsProposalsStore[$snsOnlyProjectStore.toText()]?.proposals
      : undefined;

  let nsFunctions: SnsNervousSystemFunction[] | undefined;
  $: nsFunctions =
    $snsOnlyProjectStore !== undefined
      ? $snsFunctionsStore[$snsOnlyProjectStore.toText()]?.nsFunctions
      : undefined;
</script>

<div data-tid="sns-proposals-page">
  {#if proposals === undefined}
    <div class="card-grid" data-tid="proposals-loading">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if proposals.length === 0}
    <p class="description">{$i18n.voting.nothing_found}</p>
  {:else}
    <InfiniteScroll layout="grid">
      {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
        <SnsProposalCard {proposalData} {nsFunctions} />
      {/each}
    </InfiniteScroll>
  {/if}
</div>
