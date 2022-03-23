<script lang="ts">
  import type { NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
  import { onMount } from "svelte";
  import Input from "../../components/ui/Input.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { listKnownNeurons } from "../../services/knownNeurons.services";
  import { addFollowee } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import { sortedknownNeuronsStore } from "../../stores/knownNeurons.store";
  import { toastsStore } from "../../stores/toasts.store";
  import Modal from "../Modal.svelte";

  export let neuron: NeuronInfo;
  export let topic: Topic;

  let followeeAddress: number | undefined;
  let loading: boolean = false;

  onMount(async () => await listKnownNeurons());

  const addFolloweeByAddress = async () => {
    loading = true;
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
    followeeAddress = undefined;
    toastsStore.show({
      labelKey: "new_followee.success_add_followee",
      level: "info",
    });
  };

  // TODO: Check with known neurons https://dfinity.atlassian.net/browse/L2-403
  const addKnownNeuronFollowee = async (followeeId: NeuronId) => {
    loading = true;
    await addFollowee({
      neuronId: neuron.neuronId,
      topic,
      followee: followeeId,
    });
    loading = false;
    followeeAddress = undefined;
    toastsStore.show({
      labelKey: "new_followee.success_add_followee",
      level: "info",
    });
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
        <!-- TODO: Fix style while loading - https://dfinity.atlassian.net/browse/L2-403 -->
        <button
          class="primary small"
          type="submit"
          disabled={followeeAddress === undefined || loading}
        >
          {#if loading}
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
          {#each $sortedknownNeuronsStore as knowNeuron}
            <li data-tid="known-neuron-item">
              <p>{knowNeuron.name}</p>
              <button
                class="secondary small"
                on:click={() => addKnownNeuronFollowee(knowNeuron.id)}
                >{$i18n.new_followee.follow}</button
              >
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

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
