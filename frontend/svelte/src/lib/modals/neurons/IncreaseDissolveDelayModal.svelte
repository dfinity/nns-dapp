<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import SetDissolveDelay from "../../components/neurons/SetDissolveDelay.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import ConfirmDissolveDelay from "../../components/neurons/ConfirmDissolveDelay.svelte";
  import WizardModal from "../WizardModal.svelte";
  import type { Steps } from "../../stores/steps.state";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  const steps: Steps = [
    { name: "SetDissolveDelay", showBackButton: false },
    { name: "ConfirmDissolveDelay", showBackButton: true },
  ];

  let currentStepName: string | undefined;
  let modal: WizardModal;

  let delayInSeconds: number = Number(neuron.dissolveDelaySeconds);

  const dispatcher = createEventDispatcher();
  const goBack = () => {
    modal.back();
  };
  const goNext = () => {
    modal.next();
  };
  const closeModal = () => {
    dispatcher("nnsClose");
  };

  const titleMapper: Record<string, string> = {
    SetDissolveDelay: "set_dissolve_delay",
    ConfirmDissolveDelay: "confirm_dissolve_delay",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[currentStepName ?? "SetDissolveDelay"];
</script>

<WizardModal {steps} bind:currentStepName bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{$i18n.neurons?.[titleKey]}</svelte:fragment>
  {#if currentStepName === "SetDissolveDelay"}
    <SetDissolveDelay
      {neuron}
      secondaryButtonText={$i18n.core.confirm_no}
      minDelayInSeconds={Number(neuron.dissolveDelaySeconds)}
      on:nnsSkipDelay={closeModal}
      on:nnsConfirmDelay={goNext}
      bind:delayInSeconds
    />
  {/if}
  {#if currentStepName === "ConfirmDissolveDelay"}
    <ConfirmDissolveDelay
      {neuron}
      {delayInSeconds}
      on:back={goBack}
      on:nnsUpdated={closeModal}
    />
  {/if}
</WizardModal>
