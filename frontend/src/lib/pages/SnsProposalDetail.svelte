<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { getSnsProposalById } from "$lib/services/$public/sns-proposals.services";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { SnsProposalData, SnsProposalId } from "@dfinity/sns";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Principal } from "@dfinity/principal";
  import SnsProposalSystemInfoSection from "$lib/components/sns-proposals/SnsProposalSystemInfoSection.svelte";
  import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
  import SnsProposalSummarySection from "$lib/components/sns-proposals/SnsProposalSummarySection.svelte";
  import SkeletonDetails from "$lib/components/ui/SkeletonDetails.svelte";
  import SnsProposalPayloadSection from "$lib/components/sns-proposals/SnsProposalPayloadSection.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { listNeurons } from "$lib/services/neurons.services";
  import { sortedSnsUserNeuronsStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { UniverseCanisterIdText } from "$lib/types/universe";

  export let proposalIdText: string | undefined | null = undefined;

  let universeIdText: UniverseCanisterIdText | undefined;
  $: universeIdText = $snsOnlyProjectStore?.toText();

  let neuronsReady = false;
  $: neuronsReady =
    nonNullish(universeIdText) &&
    nonNullish($snsNeuronsStore[universeIdText]?.neurons);

  $: if (!neuronsReady) {
    // fetch neurons when not fetched yet (neurons store undefined)
    (async () => {
      await syncSnsNeurons(Principal.from(universeIdText));
    })();
  }

  // TODO(sns-voting): Use proposal to render the component.
  let proposal: SnsProposalData | "loading" | "error" = "loading";

  const isLoadedProposal = (
    proposal: SnsProposalData | "loading" | "error"
  ): proposal is SnsProposalData =>
    proposal !== "loading" && proposal !== "error";

  onMount(() => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!$ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });

  // By storing the canister id as a text, we avoid calling the block below if the store is updated with the same value.
  let universeCanisterId: Principal | undefined;
  $: universeCanisterId = nonNullish(universeIdText)
    ? Principal.fromText(universeIdText)
    : undefined;
  $: {
    // TODO: Fix race condition in case the user changes the proposal before the first one hasn't loaded yet.
    if (
      nonNullish(proposalIdText) &&
      nonNullish(universeIdText) &&
      nonNullish(universeCanisterId) &&
      // neurons should be already loaded to differentiate
      neuronsReady
    ) {
      // We need this to be used in the handleError callback.
      // Otherwise, TS doesn't believe that the value of `universeCanisterIdText` won't change.
      const universeCanisterIdAtTimeOfRequest = universeIdText;
      try {
        const proposalId: SnsProposalId = {
          id: BigInt(proposalIdText as string),
        };
        // No need to force getProposal when user has no sns neurons
        const reloadForBallots =
          neuronsReady && $sortedSnsUserNeuronsStore.length > 0;
        proposal = "loading";
        getSnsProposalById({
          rootCanisterId: universeCanisterId,
          proposalId,
          setProposal: ({ proposal: proposalData }) => {
            proposal = proposalData;
          },
          handleError: () => {
            goto(
              buildProposalsUrl({
                universe: universeCanisterIdAtTimeOfRequest,
              }),
              {
                replaceState: true,
              }
            );
          },
          reloadForBallots,
        });
      } catch (error) {
        proposal = "error";
        toastsError({
          labelKey: "error.wrong_proposal_id",
          substitutions: {
            $proposalId: proposalIdText,
          },
        });
        goto(buildProposalsUrl({ universe: universeIdText }), {
          replaceState: true,
        });
      }
    } else {
      // Reset proposal to the initial state.
      proposal = "loading";
    }
  }
</script>

<div class="content-grid" data-tid="sns-proposal-details-grid">
  {#if isLoadedProposal(proposal) && nonNullish(universeCanisterId)}
    <div class="content-a">
      <SnsProposalSystemInfoSection
        {proposal}
        rootCanisterId={universeCanisterId}
      />
    </div>
    <div class="content-b expand-content-b">
      <SnsProposalVotingSection {proposal} />
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
