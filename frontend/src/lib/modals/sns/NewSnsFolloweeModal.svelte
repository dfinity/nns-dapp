<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { addFollowee } from "$lib/services/sns-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { hexStringToBytes } from "$lib/utils/utils";
  import { busy, Modal, startBusy, stopBusy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { arrayOfNumberToUint8Array } from "@dfinity/utils";
  import { createEventDispatcher, getContext } from "svelte";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let functionId: bigint;

  // This mean we can't use this modal outside of the neuron detail page.
  const { reload }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let followeeAddress = "";
  const dispatcher = createEventDispatcher();
  const add = async () => {
    startBusy({
      initiator: "add-sns-followee",
    });

    const followee: SnsNeuronId = {
      id: arrayOfNumberToUint8Array(hexStringToBytes(followeeAddress)),
    };

    await addFollowee({
      rootCanisterId,
      neuron: neuron,
      followee,
      functionId,
    });
    await reload();

    stopBusy("add-sns-followee");
    dispatcher("nnsClose");
  };
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title">{$i18n.new_followee.title}</svelte:fragment>

  <form on:submit|preventDefault={add}>
    <Input
      inputType="text"
      autocomplete="off"
      placeholderLabelKey="new_followee.address_placeholder"
      name="new-followee-id"
      bind:value={followeeAddress}
    >
      <svelte:fragment slot="label"
        >{$i18n.new_followee.address_placeholder}</svelte:fragment
      >
    </Input>
    <button
      class="primary"
      type="submit"
      disabled={followeeAddress.length === 0 || $busy}
    >
      {$i18n.new_followee.follow_neuron}
    </button>
  </form>
</Modal>
