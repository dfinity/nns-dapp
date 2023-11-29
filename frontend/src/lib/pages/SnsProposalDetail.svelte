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
    getUniversalProposalStatus,
    mapProposalInfo,
    type SnsProposalDataMap,
    snsProposalId,
    snsProposalIdString,
    sortSnsProposalsById,
  } from "$lib/utils/sns-proposals.utils";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { debugSnsProposalStore } from "../derived/debug.derived";
  import { isUniverseNns } from "$lib/utils/universe.utils";
  import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { authStore } from "$lib/stores/auth.store";
  import { SplitBlock } from "@dfinity/gix-components";
  import { navigateToProposal } from "$lib/utils/proposals.utils";
  import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
  import type { Readable } from "svelte/store";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import { tick } from "svelte";

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

  const setProposal = async (value: typeof proposal) => {
    // TODO: recheck if this workaround is still needed after next svelte update
    // workaround to fix not triggering the subscriptions ($:...) after "proposal" changes.
    // Because the update is ignored if the value is changed before onMount.
    await tick();
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

  // Update layout title
  let title = $i18n.proposal_detail.title;
  $: title = `${$i18n.proposal_detail.title}${
    nonNullish(proposalIdText) ? ` ${proposalIdText}` : ""
  }`;

  $: layoutTitleStore.set({
    title,
    header: title,
  });

  // preload sns functions for mapping
  let functionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: if (universeCanisterId) {
    loadSnsNervousSystemFunctions(universeCanisterId);
    functionsStore = createSnsNsFunctionsProjectStore(universeCanisterId);
  }

  let proposalDataMap: SnsProposalDataMap | undefined;
  $: proposalDataMap =
    nonNullish(proposal) && nonNullish($functionsStore)
      ? mapProposalInfo({
          proposalData: proposal,
          nsFunctions: $functionsStore,
        })
      : undefined;

  let proposalIds: bigint[];
  $: proposalIds = nonNullish(universeIdText)
    ? sortSnsProposalsById(
        $snsFilteredProposalsStore[universeIdText]?.proposals
      )?.map(snsProposalId) ?? []
    : [];

  // The `update` function cares about the necessary data to be refetched.
  $: universeIdText, proposalIdText, $snsNeuronsStore, $authStore, update();

  let proposalNavigationTitle: string | undefined;
  $: proposalNavigationTitle = proposalDataMap?.type;
</script>

<TestIdWrapper testId="sns-proposal-details-grid">
  {#if nonNullish(proposalIdText) && !updating && nonNullish(proposal) && nonNullish(universeCanisterId)}
    <ProposalNavigation
      title={proposalNavigationTitle}
      currentProposalId={BigInt(proposalIdText)}
      currentProposalStatus={getUniversalProposalStatus(proposal)}
      {proposalIds}
      selectProposal={navigateToProposal}
    />
  {/if}

  {#if !updating && nonNullish(proposal) && nonNullish(proposalDataMap) && nonNullish(universeCanisterId)}
    <div class="proposal-data-section">
      <div class="content-cell-island">
        <SplitBlock>
          <div slot="start">
            <SnsProposalSystemInfoSection {proposalDataMap} />
          </div>
          <div slot="end">
            <SnsProposalVotingSection
              {proposal}
              {proposalDataMap}
              {reloadProposal}
            />
          </div>
        </SplitBlock>
      </div>
      <SnsProposalSummarySection {proposal} />
      <SnsProposalPayloadSection {proposal} />
    </div>
  {:else}
    <div class="content-grid">
      <div class="content-a">
        <div class="skeleton">
          <SkeletonDetails />
        </div>
      </div>
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .proposal-data-section {
    display: flex;
    flex-direction: column;
    gap: var(--row-gap);
  }
</style>
