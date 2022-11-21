<script lang="ts">
  import { loadSnsNervousSystemFunctions } from "$lib/services/sns-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { hasPermissionToVote } from "$lib/utils/sns-neuron.utils";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { KeyValuePairInfo } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getContext } from "svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import FollowSnsNeuronsButton from "./actions/FollowSnsNeuronsButton.svelte";

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
</script>

<CardInfo>
  <KeyValuePairInfo testId="sns-neuron-following">
    <h3 slot="key">{$i18n.neuron_detail.following_title}</h3>
    <svelte:fragment slot="info"
      >{$i18n.neuron_detail.following_description}</svelte:fragment
    >
  </KeyValuePairInfo>

  <!-- TS doesn't understand that neuron is defined if allowedToManageFollows is true -->
  {#if allowedToManageFollows && nonNullish(neuron) && nonNullish(rootCanisterId)}
    <div class="actions">
      <FollowSnsNeuronsButton {neuron} {rootCanisterId} />
    </div>
  {/if}
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    padding-top: var(--padding);
  }
</style>
