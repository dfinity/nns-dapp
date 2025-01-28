<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import { createEventDispatcher, onMount } from "svelte";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import NnsLosingRewardsNeuronCard from "$lib/components/neurons/NnsLosingRewardsNeuronCard.svelte";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { goto } from "$app/navigation";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import type { NeuronInfo } from "@dfinity/nns";
  import ConfirmFollowingButton from "$lib/components/neuron-detail/actions/ConfirmFollowingButton.svelte";
  import { startReducingVotingPowerAfterSecondsStore } from "$lib/derived/network-economics.derived";
  import { nonNullish } from "@dfinity/utils";

  export let neurons: NeuronInfo[];
  export let withNeuronNavigation = true;

  const dispatcher = createEventDispatcher<{ nnsClose: void }>();

  // Load KnownNeurons which are used in the FollowNnsTopicSections
  onMount(() => listKnownNeurons());

  const close = () => dispatcher("nnsClose");
  const onConfirmed = ({
    detail: { successCount, totalCount },
  }: {
    detail: { successCount: number; totalCount: number };
  }) => {
    if (successCount === totalCount) {
      close();
    }
  };

  const navigateToNeuronDetail = async (neuron: NeuronInfo) => {
    close();
    goto(
      buildNeuronUrl({
        universe: OWN_CANISTER_ID_TEXT,
        neuronId: neuron.neuronId,
      })
    );
  };

  let neuronIds: bigint[];
  $: neuronIds = neurons.map(({ neuronId }) => neuronId);
</script>

<Modal on:nnsClose testId="losing-reward-neurons-modal-component">
  <svelte:fragment slot="title">
    {$i18n.missing_rewards_modal.title}
  </svelte:fragment>

  <div class="wrapper">
    {#if nonNullish($startReducingVotingPowerAfterSecondsStore)}
      <p class="description" data-tid="losing-rewards-description">
        {replacePlaceholders($i18n.missing_rewards.description, {
          $period: secondsToDissolveDelayDuration(
            BigInt($startReducingVotingPowerAfterSecondsStore)
          ),
        })}
      </p>
    {/if}

    <h3 class="label">{$i18n.missing_rewards_modal.label}</h3>
    <ul class="cards">
      {#each neurons as neuron (neuron.neuronId)}
        <li>
          <NnsLosingRewardsNeuronCard
            {neuron}
            onClick={withNeuronNavigation
              ? () => navigateToNeuronDetail(neuron)
              : undefined}
          />
        </li>
      {/each}
    </ul>
    <div class="toolbar">
      <button on:click={close} class="secondary" data-tid="cancel-button"
        >{$i18n.core.cancel}</button
      >
      <ConfirmFollowingButton {neuronIds} on:nnsComplete={onConfirmed} />
    </div>
  </div>
</Modal>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .description {
    margin: 0 0 var(--padding-3x);
  }

  .label {
    margin-bottom: var(--padding);
    @include fonts.standard(false);
    color: var(--description-color);
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    margin-bottom: var(--padding-3x);

    padding: 0;
    list-style-type: none;
  }
</style>
