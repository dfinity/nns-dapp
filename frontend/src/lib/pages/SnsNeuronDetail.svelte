<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SnsNeuronProposalsCard from "$lib/components/neuron-detail/SnsNeuronProposalsCard.svelte";
  import SnsNeuronTestnetFunctionsCard from "$lib/components/neuron-detail/SnsNeuronTestnetFunctionsCard.svelte";
  import SnsPermissionsCard from "$lib/components/neuron-detail/SnsPermissionsCard.svelte";
  import SnsNeuronAdvancedSection from "$lib/components/sns-neuron-detail/SnsNeuronAdvancedSection.svelte";
  import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
  import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import SnsNeuronMaturitySection from "$lib/components/sns-neuron-detail/SnsNeuronMaturitySection.svelte";
  import SnsNeuronPageHeader from "$lib/components/sns-neuron-detail/SnsNeuronPageHeader.svelte";
  import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
  import SnsNeuronVotingPowerSection from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import SkeletonHeader from "$lib/components/ui/SkeletonHeader.svelte";
  import SkeletonHeading from "$lib/components/ui/SkeletonHeading.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { debugSelectedSnsNeuronStore } from "$lib/derived/debug.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import SnsNeuronModals from "$lib/modals/sns/neurons/SnsNeuronModals.svelte";
  import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
  import { refreshNeuronIfNeeded } from "$lib/services/sns-neurons-check-balances.services";
  import { getSnsNeuron } from "$lib/services/sns-neurons.services";
  import { loadSnsParameters } from "$lib/services/sns-parameters.services";
  import { queuedStore } from "$lib/stores/queued-store";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
  } from "$lib/types/sns-neuron-detail.context";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";
  import { Island } from "@dfinity/gix-components";
  import { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Token, TokenAmountV2 } from "@dfinity/utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { onMount, setContext } from "svelte";

  export let neuronId: string | null | undefined;

  const selectedSnsNeuronStore = queuedStore<SelectedSnsNeuronStore>({
    selected: undefined,
    neuron: undefined,
  });

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: selectedSnsNeuronStore,
    reload: () => loadNeuron({ forceFetch: true }),
  });

  debugSelectedSnsNeuronStore(selectedSnsNeuronStore);

  // BEGIN: loading and navigation

  const goBack = (replaceState: boolean): Promise<void> =>
    goto($neuronsPathStore, { replaceState });

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = $selectedSnsNeuronStore.selected?.rootCanisterId;

  let parameters: SnsNervousSystemParameters | undefined;
  $: parameters =
    $snsParametersStore?.[rootCanisterId?.toText() ?? ""]?.parameters;

  let transactionFee: TokenAmountV2 | undefined;
  $: transactionFee = toTokenAmountV2($snsSelectedTransactionFeeStore);

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore as Token;

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId =
    $selectedUniverseStore.summary?.governanceCanisterId;

  const loadNeuron = async (
    { forceFetch }: { forceFetch: boolean } = { forceFetch: false }
  ) => {
    const { selected } = $selectedSnsNeuronStore;
    if (selected !== undefined && $pageStore.path === AppPath.Neuron) {
      const mutableSnsNeuronStore =
        selectedSnsNeuronStore.getSingleMutationStore();
      await getSnsNeuron({
        forceFetch,
        rootCanisterId: selected.rootCanisterId,
        neuronIdHex: selected.neuronIdHex,
        onLoad: ({
          certified,
          neuron: snsNeuron,
        }: {
          certified: boolean;
          neuron: SnsNeuron;
        }) => {
          mutableSnsNeuronStore.update({
            mutation: (store) => ({
              ...store,
              neuron: snsNeuron,
            }),
            certified,
          });
        },
        onError: () => {
          toastsError({
            labelKey: "error.neuron_not_found",
          });

          // For simplicity reason we do not catch the promise here
          goBack(true);
        },
      });
    }
  };

  onMount(async () => {
    if (neuronId === undefined || neuronId === null) {
      await goBack(true);
      return;
    }

    try {
      const rootCanisterId = Principal.fromText($pageStore.universe);
      // `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
      selectedSnsNeuronStore.getSingleMutationStore().set({
        data: {
          selected: {
            neuronIdHex: neuronId,
            rootCanisterId,
          },
          neuron: null,
        },
        certified: true,
      });

      await Promise.all([
        loadNeuron(),
        loadSnsParameters(rootCanisterId),
        loadSnsAccounts({ rootCanisterId }),
      ]);
    } catch (err: unknown) {
      // $pageStore.universe might be an invalid principal, like empty or yolo
      await goBack(true);
    }
  });

  // END: loading and navigation

  let loading: boolean;
  $: loading =
    isNullish($selectedSnsNeuronStore.neuron) ||
    isNullish(parameters) ||
    isNullish(transactionFee);

  const maybeRefreshAndReload = async ({
    rootCanisterId,
    neuron,
  }: {
    rootCanisterId: Principal | undefined;
    neuron: SnsNeuron | undefined | null;
  }) => {
    if (
      await refreshNeuronIfNeeded({
        rootCanisterId,
        neuron,
      })
    ) {
      loadNeuron({ forceFetch: true });
    }
  };

  $: maybeRefreshAndReload({
    rootCanisterId,
    neuron: $selectedSnsNeuronStore.neuron,
  });
</script>

<TestIdWrapper testId="sns-neuron-detail-component">
  <Island>
    <main class="legacy">
      <section data-tid="sns-neuron-detail-page">
        {#if loading}
          <SkeletonHeader />
          <SkeletonHeading />
          <Separator spacing="none" />
          <SkeletonCard noMargin cardType="info" separator />
          <SkeletonCard noMargin cardType="info" separator />
          <SkeletonCard noMargin cardType="info" separator />
          <!-- `loading` already checks for all that but TS is not smart enough to understand it -->
        {:else if nonNullish(parameters) && nonNullish(token) && nonNullish($selectedSnsNeuronStore.neuron) && nonNullish(transactionFee)}
          <SnsNeuronPageHeader {token} />
          <SnsNeuronPageHeading
            {parameters}
            neuron={$selectedSnsNeuronStore.neuron}
          />
          <Separator spacing="none" />
          <SnsNeuronVotingPowerSection
            neuron={$selectedSnsNeuronStore.neuron}
            {parameters}
            {token}
          />
          <Separator spacing="none" />
          <SnsNeuronMaturitySection
            neuron={$selectedSnsNeuronStore.neuron}
            fee={transactionFee}
            {token}
          />
          <Separator spacing="none" />
          <SnsNeuronAdvancedSection
            neuron={$selectedSnsNeuronStore.neuron}
            {governanceCanisterId}
            {parameters}
            {token}
            {transactionFee}
          />
          <Separator spacing="none" />
          <SnsNeuronFollowingCard />
          <Separator spacing="none" />
          <SnsNeuronHotkeysCard {parameters} />
          {#if IS_TESTNET}
            <Separator spacing="none" />
            <SnsNeuronProposalsCard />
            <Separator spacing="none" />
            <SnsNeuronTestnetFunctionsCard />
            <Separator spacing="none" />
            <SnsPermissionsCard />
          {/if}
        {/if}
      </section>
    </main>
  </Island>

  <SnsNeuronModals />
</TestIdWrapper>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }
</style>
