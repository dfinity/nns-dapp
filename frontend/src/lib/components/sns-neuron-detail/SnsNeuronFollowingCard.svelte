<script lang="ts">
  import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import {
    followeesByNeuronId,
    hasPermissionToVote,
    type SnsFolloweesByNeuron,
  } from "$lib/utils/sns-neuron.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { KeyValuePairInfo } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getContext } from "svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import FollowSnsNeuronsButton from "./actions/FollowSnsNeuronsButton.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SnsFollowee from "./SnsFollowee.svelte";
  import SkeletonFollowees from "../ui/SkeletonFollowees.svelte";
  import {
    createSnsParametersProjectStore,
    type SnsNervousSystemFunctionsProjectStore,
  } from "$lib/derived/sns-ns-functions-project.derived";

  $: {
    if (rootCanisterId !== undefined) {
      // To render the topics of the followees we need to fetch all the topics.
      loadSnsNervousSystemFunctions(rootCanisterId);
    }
  }

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = $store.selected?.rootCanisterId;

  let allowedToManageFollows: boolean;
  $: allowedToManageFollows = isNullish(neuron)
    ? false
    : hasPermissionToVote({
        neuron,
        identity: $authStore.identity,
      });

  let nsFunctions: SnsNervousSystemFunctionsProjectStore | undefined;
  $: nsFunctions = nonNullish(rootCanisterId)
    ? createSnsParametersProjectStore(rootCanisterId)
    : undefined;

  let followees: SnsFolloweesByNeuron[] = [];
  $: followees =
    isNullish(neuron) || isNullish(nsFunctions)
      ? []
      : followeesByNeuronId({
          neuron,
          nsFunctions: $nsFunctions ?? [],
        });

  let showLoading: boolean;
  $: showLoading =
    nonNullish(neuron) && neuron.followees.length > 0 && isNullish(nsFunctions);
</script>

<CardInfo testId="sns-neuron-following-card-component">
  <KeyValuePairInfo testId="sns-neuron-following">
    <h3 slot="key">{$i18n.neuron_detail.following_title}</h3>
    <svelte:fragment slot="info"
      >{$i18n.neuron_detail.following_description}</svelte:fragment
    >
  </KeyValuePairInfo>

  {#if followees.length > 0}
    <div class="frame">
      {#each followees as followee}
        <SnsFollowee {followee} />
      {/each}
    </div>
  {/if}

  {#if showLoading}
    <div class="frame">
      <SkeletonFollowees />
    </div>
  {/if}

  <!-- TS doesn't understand that neuron is defined if allowedToManageFollows is true -->
  {#if allowedToManageFollows && nonNullish(neuron) && nonNullish(rootCanisterId)}
    <div class="actions">
      <FollowSnsNeuronsButton />
    </div>
  {/if}
</CardInfo>

<Separator />

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .frame {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    padding-top: var(--padding);
  }
</style>
