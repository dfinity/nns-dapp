<script lang="ts">
  import { goto } from "$app/navigation";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { snsProjectsRecordStore } from "$lib/derived/sns/sns-projects.derived";
  import NnsStakeNeuronModal from "$lib/modals/neurons/NnsStakeNeuronModal.svelte";
  import SnsStakeNeuronModal from "$lib/modals/sns/neurons/SnsStakeNeuronModal.svelte";
  import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { Universe } from "$lib/types/universe";
  import { buildNeuronsUrl } from "$lib/utils/navigation.utils";
  import { IconNeuronsPage, PageBanner } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    TokenAmountV2,
    isNullish,
    nonNullish,
    type Token,
  } from "@dfinity/utils";
  import { get } from "svelte/store";
  import { ENABLE_PERIODIC_FOLLOWING_CONFIRMATION } from "$lib/stores/feature-flags.store";
  import LosingRewardsBanner from "$lib/components/neurons/LosingRewardsBanner.svelte";

  const getShowStakingBanner = ({
    isSignedIn,
    universes,
    nnsNeurons,
    snsNeurons,
  }: {
    isSignedIn: boolean;
    universes: Universe[];
    nnsNeurons: NeuronInfo[] | undefined;
    snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
  }) => {
    if (!isSignedIn) {
      return true;
    }
    // If the user is signed in, we show the staking banner if we know the user
    // has 0 neurons.
    if (nnsNeurons?.length !== 0) {
      return false;
    }
    for (const universe of universes) {
      if (universe.canisterId === OWN_CANISTER_ID_TEXT) {
        continue;
      }
      if (snsNeurons[universe.canisterId]?.neurons?.length !== 0) {
        return false;
      }
    }
    return true;
  };

  let showStakingBanner: boolean;
  $: showStakingBanner = getShowStakingBanner({
    isSignedIn: $authSignedInStore,
    universes: $selectableUniversesStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
  });

  let isNnsStakingModalOpen: boolean = false;

  const openNnsStakingModal = () => {
    isNnsStakingModalOpen = true;
  };

  let snsStakingModalData:
    | {
        rootCanisterId: Principal;
        governanceCanisterId: Principal;
        token: Token;
        transactionFee: TokenAmountV2;
      }
    | undefined = undefined;

  const openSnsStakingModal = async (rootCanisterIdText: string) => {
    const summary = get(snsProjectsRecordStore)[rootCanisterIdText].summary;

    // Accounts need to be loaded to display the account and balance used for
    // staking.
    loadSnsAccounts({
      rootCanisterId: summary.rootCanisterId,
    });

    snsStakingModalData = {
      rootCanisterId: summary.rootCanisterId,
      governanceCanisterId: summary.governanceCanisterId,
      token: summary.token,
      transactionFee: TokenAmountV2.fromUlps({
        amount: summary.token.fee,
        token: summary.token,
      }),
    };
  };

  const openStakingModal = ({
    detail: { universeId },
  }: {
    detail: { universeId: string };
  }) => {
    if (universeId === OWN_CANISTER_ID_TEXT) {
      openNnsStakingModal();
    } else {
      openSnsStakingModal(universeId);
    }
  };

  const closeNnsStakingModal = () => {
    const neurons = get(neuronsStore).neurons;

    // If a neuron was created, navigate to the neurons table.
    if (nonNullish(neurons) && neurons?.length > 0) {
      goto(buildNeuronsUrl({ universe: OWN_CANISTER_ID_TEXT }));
    }
    isNnsStakingModalOpen = false;
  };

  const closeSnsStakingModal = () => {
    if (isNullish(snsStakingModalData)) {
      // The modal can only be open if snsStakingModalData is not nullish.
      return;
    }
    const snsNeurons = get(snsNeuronsStore);
    const neuronCount =
      snsNeurons[snsStakingModalData.rootCanisterId.toText()]?.neurons
        ?.length ?? 0;

    // If a neuron was created, navigate to the neurons table.
    if (neuronCount > 0) {
      goto(
        buildNeuronsUrl({
          universe: snsStakingModalData.rootCanisterId.toText(),
        })
      );
    }
    snsStakingModalData = undefined;
  };
</script>

<TestIdWrapper testId="staking-component">
  <IslandWidthMain>
    <div class="content">
      {#if showStakingBanner}
        <PageBanner testId="staking-page-banner">
          <IconNeuronsPage slot="image" />
          <svelte:fragment slot="title">{$i18n.staking.title}</svelte:fragment>
          <p class="description" slot="description">{$i18n.staking.text}</p>
          <SignInGuard slot="actions" />
        </PageBanner>
      {/if}

      {#if $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION}
        <LosingRewardsBanner />
      {/if}

      <ProjectsTable on:nnsStakeTokens={openStakingModal} />
    </div>
  </IslandWidthMain>

  {#if isNnsStakingModalOpen}
    <NnsStakeNeuronModal on:nnsClose={closeNnsStakingModal} />
  {/if}

  {#if nonNullish(snsStakingModalData)}
    <SnsStakeNeuronModal
      token={snsStakingModalData.token}
      on:nnsClose={closeSnsStakingModal}
      rootCanisterId={snsStakingModalData.rootCanisterId}
      transactionFee={snsStakingModalData.transactionFee}
      governanceCanisterId={snsStakingModalData.governanceCanisterId}
    />
  {/if}
</TestIdWrapper>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
