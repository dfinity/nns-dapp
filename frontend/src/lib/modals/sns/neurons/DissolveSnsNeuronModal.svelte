<script lang="ts">
    import { NeuronState } from "@dfinity/nns";
    import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
    import { startBusy, stopBusy } from "$lib/stores/busy.store";
    import { i18n } from "$lib/stores/i18n";
    import type { SnsNeuronId } from "@dfinity/sns";
    import {
        startDissolving,
        stopDissolving,
    } from "$lib/services/sns-neurons.services";
    import type { Principal } from "@dfinity/principal";
    import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
    import {isNullish, keyOf} from "$lib/utils/utils";
    import type {SnsNeuron} from "@dfinity/sns";
    import {getSnsNeuronState} from "$lib/utils/sns-neuron.utils";
    import {createEventDispatcher} from "svelte";
    import {fromDefinedNullable} from "@dfinity/utils";

    export let neuron: SnsNeuron;
    export let reloadNeuron: () => Promise<void>;

    let neuronId: SnsNeuronId | undefined;
    $: neuronId =
        neuron?.id !== undefined ? fromDefinedNullable(neuron.id) : undefined;

    let neuronState: NeuronState | undefined;
    $: neuronState = isNullish(neuron) ? undefined : getSnsNeuronState(neuron);

    let isDissolving: boolean;
    let descriptionKey: string;
    $: {
        isDissolving = neuronState === NeuronState.Dissolving;
        descriptionKey = isDissolving
            ? "stop_dissolve_description"
            : "start_dissolve_description";
    }

    const dissolveAction = async () => {
        const action = isDissolving ? stopDissolving : startDissolving;

        let rootCanisterId: Principal = $snsOnlyProjectStore as Principal;

        startBusy({ initiator: "dissolve-action" });

        await action({ rootCanisterId, neuronId });

        await reloadNeuron();

        closeModal();
        stopBusy("dissolve-action");
    };

    const dispatcher = createEventDispatcher();
    const closeModal = () => dispatcher("nnsClose");
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm={dissolveAction}>
    <div data-tid="dissolve-sns-neuron-modal">
        <h4>{$i18n.core.confirm}</h4>
        <p>{keyOf({ obj: $i18n.neuron_detail, key: descriptionKey })}</p>
    </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../../themes/mixins/confirmation-modal";

  div {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>
