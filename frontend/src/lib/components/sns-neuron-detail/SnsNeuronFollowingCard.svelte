<script lang="ts">
  import SnsFollowee from "$lib/components/sns-neuron-detail/SnsFollowee.svelte";
  import FollowSnsNeuronsButton from "$lib/components/sns-neuron-detail/actions/FollowSnsNeuronsButton.svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import SkeletonFollowees from "$lib/components/ui/SkeletonFollowees.svelte";
  import {
    createSnsNsFunctionsProjectStore,
    type SnsNervousSystemFunctionsProjectStore,
  } from "$lib/derived/sns-ns-functions-project.derived";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_SNS_TOPICS } from "$lib/stores/feature-flags.store";
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
  import { IconRight, KeyValuePairInfo } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { getContext } from "svelte";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";

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
    ? createSnsNsFunctionsProjectStore(rootCanisterId)
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
    nonNullish(neuron) &&
    neuron.followees.length > 0 &&
    isNullish($nsFunctions);

  let isFollowByTopic: boolean;
  $: isFollowByTopic =
    $ENABLE_SNS_TOPICS &&
    nonNullish(rootCanisterId) &&
    nonNullish($snsTopicsStore[rootCanisterId?.toText()]);
</script>

<CardInfo noMargin testId="sns-neuron-following-card-component">
  <KeyValuePairInfo testId="sns-neuron-following">
    <h3 slot="key">{$i18n.neuron_detail.following_title}</h3>
    <svelte:fragment slot="info">
      <div class="key-value-pair-info-wrapper">
        {#if $ENABLE_SNS_TOPICS}
          <span>
            {$i18n.neuron_detail.following_description}
          </span>
          <span class="note">
            {$i18n.neuron_detail.following_note}
          </span>
        {:else}
          <span>
            {$i18n.neuron_detail.following_description_to_be_removed}
          </span>
        {/if}
      </div>
    </svelte:fragment>
  </KeyValuePairInfo>

  {#if !isFollowByTopic && followees.length > 0}
    <div class="frame">
      {#each followees as followee}
        <SnsFollowee {followee} />
      {/each}
    </div>
  {/if}

  {#if isFollowByTopic}
    <button
      data-tid="sns-topic-definitions-button"
      class="ghost with-icon sns-topic-definitions-button"
      on:click={() =>
        openSnsNeuronModal({
          type: "sns-topic-definitions",
        })}
    >
      <span>{$i18n.neuron_detail.following_link} </span>
      <IconRight />
    </button>
  {/if}

  {#if showLoading}
    <div class="frame">
      <SkeletonFollowees />
    </div>
  {/if}

  <!-- TS doesn't understand that neuron is defined if allowedToManageFollows is true -->
  {#if allowedToManageFollows && nonNullish(neuron) && nonNullish(rootCanisterId)}
    <div class="actions">
      <FollowSnsNeuronsButton {isFollowByTopic} />
    </div>
  {/if}
</CardInfo>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

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

  .key-value-pair-info-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding);

    .note {
      @include fonts.small(true);
    }
  }

  .sns-topic-definitions-button {
    padding: var(--padding) 0 var(--padding-2x);
    color: var(--primary);
    font-weight: var(--font-weight-bold);
  }
</style>
