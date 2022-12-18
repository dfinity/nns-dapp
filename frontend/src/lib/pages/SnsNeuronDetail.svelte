<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import SnsNeuronMetaInfoCard from "$lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
  import { getSnsNeuron } from "$lib/services/sns-neurons.services";
  import {
    type SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
    SELECTED_SNS_NEURON_CONTEXT_KEY,
  } from "$lib/types/sns-neuron-detail.context";
  import { writable } from "svelte/store";
  import { onMount, setContext } from "svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import SnsNeuronMaturityCard from "$lib/components/sns-neuron-detail/SnsNeuronMaturityCard.svelte";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
  import SnsNeuronInfoStake from "$lib/components/sns-neuron-detail/SnsNeuronInfoStake.svelte";
  import { Island } from "@dfinity/gix-components";
  import SnsNeuronModals from "$lib/modals/sns/neurons/SnsNeuronModals.svelte";
  import { debugSelectedSnsNeuronStore } from "$lib/stores/debug.store";
  import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
  import { loadSnsParameters } from "$lib/services/sns-parameters.services";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import type { TokenAmount } from "@dfinity/nns";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { loadSnsTransactionFee } from "$lib/services/transaction-fees.services";

  export let neuronId: string | null | undefined;

  const selectedSnsNeuronStore = writable<SelectedSnsNeuronStore>({
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

  let rootCanisterId: Principal;
  $: rootCanisterId = Principal.fromText($pageStore.universe);

  let parameters: NervousSystemParameters | undefined;
  $: parameters = $snsParametersStore?.[rootCanisterId.toText()]?.parameters;

  let fee: TokenAmount | undefined;
  $: fee = $snsSelectedTransactionFeeStore;

  const loadNeuron = async (
    { forceFetch }: { forceFetch: boolean } = { forceFetch: false }
  ) => {
    const { selected } = $selectedSnsNeuronStore;
    if (selected !== undefined && $pageStore.path === AppPath.Neuron) {
      await getSnsNeuron({
        forceFetch,
        rootCanisterId: selected.rootCanisterId,
        neuronIdHex: selected.neuronIdHex,
        onLoad: ({ neuron: snsNeuron }: { neuron: SnsNeuron }) => {
          selectedSnsNeuronStore.update((store) => ({
            ...store,
            neuron: snsNeuron,
          }));
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

    if (parameters === undefined) {
      // TODO: move to context store
      loadSnsParameters(rootCanisterId);
    }

    if (fee === undefined) {
      // TODO: move to context store
      loadSnsTransactionFee(rootCanisterId);
    }

    try {
      // `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
      selectedSnsNeuronStore.set({
        selected: {
          neuronIdHex: neuronId,
          rootCanisterId: Principal.fromText($pageStore.universe),
        },
        neuron: null,
      });

      await loadNeuron();
    } catch (err: unknown) {
      // $pageStore.universe might be an invalid principal, like empty or yolo
      await goBack(true);
    }
  });

  // END: loading and navigation

  let loading: boolean;
  $: loading =
    $selectedSnsNeuronStore.neuron === null ||
    parameters === undefined ||
    fee === undefined;
  $: console.log("...loading", $selectedSnsNeuronStore.neuron, parameters, fee);
</script>

<Island>
  <main class="legacy">
    <section data-tid="sns-neuron-detail-page">
      {#if loading}
        <SkeletonCard size="large" cardType="info" separator />
        <SkeletonCard cardType="info" separator />
        <SkeletonCard cardType="info" separator />
        <SkeletonCard cardType="info" separator />
      {:else}
        <SnsNeuronMetaInfoCard />
        <SnsNeuronInfoStake />
        <SnsNeuronMaturityCard />
        <SnsNeuronFollowingCard />
        <SnsNeuronHotkeysCard />
      {/if}
    </section>
  </main>
</Island>

<SnsNeuronModals />
