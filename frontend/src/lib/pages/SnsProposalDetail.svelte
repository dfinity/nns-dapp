<script lang="ts">
  import { goto } from "$app/navigation";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { getSnsProposalById } from "$lib/services/$public/sns-proposals.services";
  import type { SnsProposalData, SnsProposalId } from "@dfinity/sns";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Principal } from "@dfinity/principal";
  import SnsProposalSystemInfoSection from "$lib/components/sns-proposals/SnsProposalSystemInfoSection.svelte";
  import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
  import SnsProposalSummarySection from "$lib/components/sns-proposals/SnsProposalSummarySection.svelte";
  import SkeletonDetails from "$lib/components/ui/SkeletonDetails.svelte";
  import SnsProposalPayloadSection from "$lib/components/sns-proposals/SnsProposalPayloadSection.svelte";
  import { sortedSnsUserNeuronsStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { UniverseCanisterIdText } from "$lib/types/universe";
  import { pageStore } from "$lib/derived/page.derived";
  import { loadSnsParameters } from "$lib/services/sns-parameters.services";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
  import {
    snsProposalId,
    snsProposalIdString,
    sortSnsProposalsById,
  } from "$lib/utils/sns-proposals.utils";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { debugSnsProposalStore } from "../derived/debug.derived";
  import { isUniverseNns } from "$lib/utils/universe.utils";
  import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
  import { navigateToProposal } from "$lib/utils/proposals.utils";
  import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
  import { isUIntString } from "$lib/utils/utils";

  export let proposalIdText: string | undefined | null = undefined;

  // TODO: why using $pageStore.universe and not $selectedUniverseIdStore as in other components and routes?
  let universeId: Principal;
  $: universeId = Principal.fromText($pageStore.universe);

  let universeIdText: string | undefined;
  $: universeIdText = universeId.toText();

  let neuronsReady = false;
  $: neuronsReady =
    nonNullish(universeIdText) &&
    nonNullish($snsNeuronsStore[universeIdText]?.neurons);

  // TODO: Use proposal to render the component.
  let proposal: SnsProposalData | undefined;
  let updating = false;

  const setProposal = (value: typeof proposal) => {
    proposal = value;
    debugSnsProposalStore(value);
  };

  const goBack = async (
    universe: UniverseCanisterIdText | undefined
  ): Promise<void> =>
    nonNullish(universe)
      ? goto(
          buildProposalsUrl({
            universe,
          }),
          {
            replaceState: true,
          }
        )
      : undefined;
  // By storing the canister id as a text, we avoid calling the block below if the store is updated with the same value.
  let universeCanisterId: Principal | undefined;
  $: universeCanisterId = nonNullish(universeIdText)
    ? Principal.fromText(universeIdText)
    : undefined;

  let universeCanisterIdAtTimeOfRequest: string | undefined;
  const reloadProposal = async () => {
    if (
      isNullish(proposalIdText) ||
      isNullish(universeIdText) ||
      isNullish(universeCanisterId)
    ) {
      return;
    }

    // We need this to be used in the handleError callback.
    // Otherwise, TS doesn't believe that the value of `universeCanisterIdText` won't change.
    universeCanisterIdAtTimeOfRequest = universeIdText;

    const proposalId: SnsProposalId = {
      id: BigInt(proposalIdText as string),
    };
    // No need to force getProposal when user has no sns neurons
    const reloadForBallots =
      neuronsReady && $sortedSnsUserNeuronsStore.length > 0;
    return getSnsProposalById({
      rootCanisterId: universeCanisterId as Principal,
      proposalId,
      setProposal: ({
        proposal: proposalData,
      }: {
        proposal: SnsProposalData;
      }) => {
        // Fix race condition in case the user changes the proposal before the first one hasn't loaded yet.
        // TODO(sns-voting): test this
        if (snsProposalIdString(proposalData) !== proposalIdText) {
          return;
        }
        setProposal(proposalData);
      },
      handleError: () => goBack(universeCanisterIdAtTimeOfRequest),
      reloadForBallots,
    });
  };

  const update = async () => {
    if (updating) {
      return;
    }

    if (
      nonNullish(proposalIdText) &&
      nonNullish(universeIdText) &&
      nonNullish(universeCanisterId) &&
      // TODO: improve testing to ensure reloadProposal is not called
      !isUniverseNns(universeCanisterId)
    ) {
      try {
        updating = true;

        await Promise.all([
          // skip neurons call when not signedIn or when neurons are not ready
          neuronsReady || !$authSignedInStore
            ? undefined
            : syncSnsNeurons(universeId),
          //
          !$authSignedInStore ? undefined : loadSnsParameters(universeId),
          loadSnsNervousSystemFunctions(universeId),
          reloadProposal(),
        ]);
      } catch (error) {
        toastsError({
          labelKey: "error.wrong_proposal_id",
          substitutions: {
            $proposalId: proposalIdText,
          },
        });

        await goBack(universeIdText);
      } finally {
        updating = false;
      }
    } else {
      // Reset proposal to the initial state.
      setProposal(undefined);
    }
  };

  // The `update` function cares about the necessary data to be refetched.
  $: universeIdText, proposalIdText, $snsNeuronsStore, update();

  let proposalIds: bigint[];
  $: proposalIds = nonNullish(universeIdText)
    ? sortSnsProposalsById(
        $snsFilteredProposalsStore[universeIdText]?.proposals
      )?.map(snsProposalId) ?? []
    : [];
</script>

{#if nonNullish(proposalIdText) && isUIntString(proposalIdText)}
  <ProposalNavigation
    currentProposalId={BigInt(proposalIdText)}
    {proposalIds}
    selectProposal={navigateToProposal}
  />
{/if}

<div class="content-grid" data-tid="sns-proposal-details-grid">
  {#if !updating && nonNullish(proposal) && nonNullish(universeCanisterId)}
    <div class="content-a">
      <SnsProposalSystemInfoSection
        {proposal}
        rootCanisterId={universeCanisterId}
      />
    </div>
    <div class="content-b expand-content-b">
      <SnsProposalVotingSection {proposal} {reloadProposal} />
    </div>
    <div class="content-c proposal-data-section">
      <SnsProposalSummarySection {proposal} />
      <SnsProposalPayloadSection {proposal} />
    </div>
  {:else}
    <div class="content-a">
      <div class="skeleton">
        <SkeletonDetails />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .proposal-data-section {
    display: flex;
    flex-direction: column;
    gap: var(--row-gap);
  }

  @include media.min-width(medium) {
    // If this would be use elsewhere, we can extract some utility to gix-components
    .content-b.expand-content-b {
      grid-row-end: content-c;
    }
  }
</style>
