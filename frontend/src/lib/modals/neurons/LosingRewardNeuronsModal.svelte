<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import { createEventDispatcher, onMount } from "svelte";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { START_REDUCING_VOTING_POWER_AFTER_SECONDS } from "$lib/constants/neurons.constants";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { soonLosingRewardNeuronsStore } from "$lib/derived/neurons.derived";
  import NnsLosingRewardsNeuronCard from "$lib/components/neurons/NnsLosingRewardsNeuronCard.svelte";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { goto } from "$app/navigation";
  import { buildNeuronUrl } from "$lib/utils/navigation.utils";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import type { NeuronInfo } from "@dfinity/nns";
  import ConfirmFollowingButton from "../../components/neuron-detail/actions/ConfirmFollowingButton.svelte";

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
  $: neuronIds = $soonLosingRewardNeuronsStore.map((neuron) => neuron.neuronId);
</script>

<Modal on:nnsClose testId="losing-reward-neurons-modal-component">
  <svelte:fragment slot="title">
    {$i18n.losing_rewards_modal.title}
  </svelte:fragment>

  <div class="wrapper">
    <p class="description">
      {replacePlaceholders($i18n.losing_rewards.description, {
        $period: secondsToDissolveDelayDuration(
          BigInt(START_REDUCING_VOTING_POWER_AFTER_SECONDS)
        ),
      })}
    </p>

    <h3 class="label">{$i18n.losing_rewards_modal.label}</h3>
    <ul class="cards">
      {#each $soonLosingRewardNeuronsStore as neuron (neuron.neuronId)}
        <li>
          <NnsLosingRewardsNeuronCard
            {neuron}
            on:nnsClick={() => navigateToNeuronDetail(neuron)}
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
