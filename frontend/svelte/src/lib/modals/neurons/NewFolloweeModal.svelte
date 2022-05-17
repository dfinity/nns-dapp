<script lang="ts">
  import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import KnownNeuronFollowItem from "../../components/neurons/KnownNeuronFollowItem.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { listKnownNeurons } from "../../services/knownNeurons.services";
  import { addFollowee } from "../../services/neurons.services";
  import { accountsStore } from "../../stores/accounts.store";
  import { authStore } from "../../stores/auth.store";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { sortedknownNeuronsStore } from "../../stores/knownNeurons.store";
  import {
    followeesByTopic,
    isHotKeyControllable,
    isNeuronControllable,
  } from "../../utils/neuron.utils";
  import Modal from "../Modal.svelte";

  export let neuron: NeuronInfo;
  export let topic: Topic;

  let isControllableByUser: boolean;
  $: isControllableByUser = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });
  let isControllableByHotkey: boolean;
  $: isControllableByHotkey = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });
  let isUserAuthorized: boolean;
  $: isUserAuthorized =
    topic === Topic.ManageNeuron
      ? isControllableByUser
      : isControllableByUser || isControllableByHotkey;

  let followeeAddress: string = "";
  let loadingAddress: boolean = false;
  let loading: boolean = false;
  let topicFollowees: NeuronId[];
  $: topicFollowees = followeesByTopic({ neuron, topic }) ?? [];

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
    let followee: bigint;
    if (followeeAddress.length === 0) {
      return;
    }

    try {
      followee = BigInt(followeeAddress);
    } catch (error) {
      // TODO: Show error in Input - https://dfinity.atlassian.net/browse/L2-408
      alert(`Incorrect followee address ${followeeAddress}`);
      return;
    }

    loading = true;
    loadingAddress = true;
    startBusy({initiator: "add-followee"});

    await addFollowee({
      neuronId: neuron.neuronId,
      topic,
      followee,
    });

    loading = false;
    loadingAddress = false;
    stopBusy("add-followee");

    followeeAddress = "";
  };
</script>

<Modal theme="dark" size="medium" on:nnsClose>
  <span slot="title">{$i18n.new_followee.title}</span>
  <main data-tid="new-followee-modal">
    <article>
      <form on:submit|preventDefault={addFolloweeByAddress}>
        <Input
          inputType="text"
          autocomplete="off"
          placeholderLabelKey="new_followee.address_placeholder"
          name="new-followee-address"
          bind:value={followeeAddress}
          theme="dark"
        />
        <button
          class={`primary small ${loadingAddress ? "icon-only" : ""}`}
          type="submit"
          disabled={followeeAddress.length === 0 ||
            loading ||
            !isUserAuthorized}
        >
          {#if loadingAddress}
            <Spinner inline size="small" />
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
                disabled={loading || !isUserAuthorized}
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
    padding: var(--padding-3x);

    --input-width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
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
