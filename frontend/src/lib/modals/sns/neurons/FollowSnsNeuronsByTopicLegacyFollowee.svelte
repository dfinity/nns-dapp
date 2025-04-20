<script lang="ts">
  import type { SnsNervousSystemFunction, SnsNeuronId } from "@dfinity/sns";
  import FollowSnsNeuronsByTopicFollowee from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicFollowee.svelte";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";

  type Props = {
    nsFunction: SnsNervousSystemFunction;
    neuronId: SnsNeuronId;
    onRemoveClick: () => void;
  };
  const { nsFunction, neuronId, onRemoveClick }: Props = $props();

  // Generate a unique id, because otherwise the Hash.Tooltip component uses neuronId as an element id.
  // This is a problem because the neuronId is not unique for legacy followees.
  const id = $derived(
    nsFunction.id.toString() + subaccountToHexString(neuronId.id)
  );
</script>

<div
  data-tid="follow-sns-neurons-by-topic-legacy-followee-component"
  class="container"
>
  <div data-tid="ns-function" class="ns-function">{nsFunction.name}</div>
  <FollowSnsNeuronsByTopicFollowee {id} {neuronId} {onRemoveClick} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .container {
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  .ns-function {
    @include fonts.small(true);

    display: flex;
    align-items: center;
    border-radius: var(--border-radius-0_5x);

    margin-bottom: var(--padding-0_5x);
    padding: var(--padding-0_5x) var(--padding);
    color: var(--tag-text);
    border: 1px solid var(--tag-text);
  }
</style>
