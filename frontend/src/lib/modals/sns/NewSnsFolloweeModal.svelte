<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { addFollowee } from "$lib/services/sns-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { busy, Modal, startBusy, stopBusy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { createEventDispatcher, getContext } from "svelte";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let functionId: bigint;

  // This mean we can't use this modal outside of the neuron detail page.
  const { reload }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let followeeHex = "";
  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");
  const add = async () => {
    startBusy({
      initiator: "add-sns-followee",
    });

    const { success } = await addFollowee({
      rootCanisterId,
      neuron: neuron,
      followeeHex,
      functionId,
    });
    if (success) {
      await reload();
    }

    stopBusy("add-sns-followee");

    if (success) {
      close();
    }
  };
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title">{$i18n.new_followee.title}</svelte:fragment>

  <form on:submit|preventDefault={add}>
    <Input
      inputType="text"
      autocomplete="off"
      placeholderLabelKey="new_followee.placeholder"
      name="new-followee-id"
      bind:value={followeeHex}
    >
      <svelte:fragment slot="label">{$i18n.new_followee.label}</svelte:fragment>
    </Input>
    <div class="toolbar">
      <button class="secondary" type="button" on:click={close}>
        {$i18n.core.cancel}
      </button>
      <button
        class="primary"
        type="submit"
        data-tid="add-followee-button"
        disabled={followeeHex.length === 0 || $busy}
      >
        {$i18n.new_followee.follow_neuron}
      </button>
    </div>
  </form>
</Modal>
