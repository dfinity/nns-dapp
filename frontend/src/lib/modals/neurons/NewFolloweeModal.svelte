<script lang="ts">
  import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher, onMount } from "svelte";
  import KnownNeuronFollowItem from "$lib/components/neurons/KnownNeuronFollowItem.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { addFollowee } from "$lib/services/neurons.services";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { sortedknownNeuronsStore } from "$lib/stores/known-neurons.store";
  import {
    followeesByTopic,
    isHotKeyControllable,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { busy, Modal } from "@dfinity/gix-components";

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

  let followeeAddress = "";

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

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };
  const addFolloweeByAddress = async () => {
    let followee: bigint;
    if (followeeAddress.length === 0) {
      return;
    }

    try {
      followee = BigInt(followeeAddress);
    } catch (error: unknown) {
      // TODO: Show error in Input - https://dfinity.atlassian.net/browse/L2-408
      alert(`Incorrect followee address ${followeeAddress}`);
      return;
    }

    startBusy({ initiator: "add-followee" });

    await addFollowee({
      neuronId: neuron.neuronId,
      topic,
      followee,
    });

    stopBusy("add-followee");
    close();

    followeeAddress = "";
  };
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title">{$i18n.new_followee.title}</svelte:fragment>

  <form on:submit|preventDefault={addFolloweeByAddress}>
    <Input
      inputType="text"
      autocomplete="off"
      placeholderLabelKey="new_followee.placeholder"
      name="new-followee-address"
      bind:value={followeeAddress}
    >
      <svelte:fragment slot="label">{$i18n.new_followee.label}</svelte:fragment>
    </Input>
    <button
      class="primary"
      type="submit"
      disabled={followeeAddress.length === 0 || !isUserAuthorized || $busy}
    >
      {$i18n.new_followee.follow_neuron}
    </button>
  </form>

  <div class="following">
    <span class="label">{$i18n.new_followee.options_title}</span>
    {#if $sortedknownNeuronsStore === undefined}
      <Spinner />
    {:else}
      <ul>
        {#each $sortedknownNeuronsStore as knownNeuron}
          <li data-tid="known-neuron-item">
            <KnownNeuronFollowItem
              on:nnsUpdated={close}
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
  </div>
</Modal>

<style lang="scss">
  form {
    gap: var(--padding-2x);
  }

  button {
    width: fit-content;
    align-self: flex-end;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    padding: var(--padding-1_5x) 0 0;
  }

  .following {
    margin: var(--padding-4x) 0 0;
  }
</style>
