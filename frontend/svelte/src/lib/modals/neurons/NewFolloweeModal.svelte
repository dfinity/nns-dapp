<script lang="ts">
  import type { NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
  import { onMount } from "svelte";
  import KnownNeuronFollowItem from "../../components/neurons/KnownNeuronFollowItem.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { listKnownNeurons } from "../../services/knownNeurons.services";
  import { addFollowee } from "../../services/neurons.services";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { sortedknownNeuronsStore } from "../../stores/knownNeurons.store";
  import Modal from "../Modal.svelte";

  export let neuron: NeuronInfo;
  export let topic: Topic;

  let followeeAddress: number | undefined;
  let loadingAddress: boolean = false;
  let loading: boolean = false;
  let topicFollowees: NeuronId[];
  $: {
    const topicInfo = neuron.fullNeuron?.followees.find(
      (followee) => followee.topic === topic
    );
    topicFollowees = topicInfo?.followees ?? [];
  }

  onMount(() => listKnownNeurons());

  const followsKnownNeuron = ({
    followees,
    knownNeuronId,
  }: {
    followees: NeuronId[];
    knownNeuronId: NeuronId;
  }): boolean => followees.find((id) => id === knownNeuronId) !== undefined;

  // We can't edit two followees at the same time.
  // Canister edits followees by sending the new array of followees.
  const updateLoading = ({ detail }: CustomEvent<{ loading: boolean }>) => {
    loading = detail.loading;
  };

  const addFolloweeByAddress = async () => {
    loading = true;
    loadingAddress = true;
    startBusy("add-followee");
    let followee: bigint;
    if (followeeAddress === undefined) {
      return;
    }
    try {
      followee = BigInt(followeeAddress);
    } catch (error) {
      // TODO: Show error in Input - https://dfinity.atlassian.net/browse/L2-408
      alert(`Incorrect followee address ${followeeAddress}`);
      loading = false;
      return;
    }
    await addFollowee({
      neuronId: neuron.neuronId,
      topic,
      followee,
    });
    loading = false;
    loadingAddress = false;
    followeeAddress = undefined;
    stopBusy("add-followee");
  };
</script>

<Modal theme="dark" size="medium" on:nnsClose>
  <span slot="title">{$i18n.new_followee.title}</span>
  <main data-tid="new-followee-modal">
    <article>
      <form on:submit|preventDefault={addFolloweeByAddress}>
        <Input
          inputType="number"
          placeholderLabelKey="new_followee.address_placeholder"
          name="new-followee-address"
          bind:value={followeeAddress}
          theme="dark"
        />
        <!-- TODO: Fix style while loading - https://dfinity.atlassian.net/browse/L2-404 -->
        <button
          class="primary small"
          type="submit"
          disabled={followeeAddress === undefined || loading}
        >
          {#if loadingAddress}
            <Spinner />
          {:else}
            {$i18n.new_followee.follow_neuron}
          {/if}
        </button>
      </form>
    </article>
    <article>
      <h4>{$i18n.new_followee.options_title}</h4>
      {#if $sortedknownNeuronsStore === undefined}
        <Spinner />
      {:else}
        <ul>
          {#each $sortedknownNeuronsStore as knownNeuron}
            <li data-tid="known-neuron-item">
              <KnownNeuronFollowItem
                on:nnsLoading={updateLoading}
                disabled={loading}
                {knownNeuron}
                neuronId={neuron.neuronId}
                {topic}
                isFollowed={followsKnownNeuron({
                  followees: topicFollowees,
                  knownNeuronId: knownNeuron.id,
                })}
              />
            </li>
          {/each}
        </ul>
      {/if}
    </article>
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));

    --input-width: 100%;
    display: flex;
    flex-direction: column;
    gap: calc(2 * var(--padding));
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
