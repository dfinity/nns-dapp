<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import SetSnsDissolveDelay from "$lib/components/sns-neurons/SetSnsDissolveDelay.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getSnsLockedTimeInSeconds } from "$lib/utils/sns-neuron.utils";
  import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
  import type { Token } from "@dfinity/nns";

  export let neuron: SnsNeuron;
  export let token: Token;
  export let reloadNeuron: () => Promise<void>;

  const steps: WizardSteps = [
    {
      name: "SetSnsDissolveDelay",
      title: $i18n.neurons.set_dissolve_delay,
    },
    {
      name: "ConfirmSnsDissolveDelay",
      title: $i18n.neurons.confirm_dissolve_delay,
    },
  ];

  let currentStep: WizardStep;
  let modal: WizardModal;

  let delayInSeconds = Number(getSnsLockedTimeInSeconds(neuron) ?? 0n);

  let minDelayInSeconds: number | undefined;
  $: minDelayInSeconds = Number(getSnsLockedTimeInSeconds(neuron) ?? 0n);

  const dispatcher = createEventDispatcher();
  const goNext = () => {
    modal.next();
  };
  const closeModal = () => {
    dispatcher("nnsClose");
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>
  {#if currentStep.name === "SetSnsDissolveDelay"}
    <SetSnsDissolveDelay
      {neuron}
      {token}
      cancelButtonText={$i18n.core.cancel}
      confirmButtonText={$i18n.neurons.update_delay}
      {minDelayInSeconds}
      on:nnsCancel={closeModal}
      on:nnsConfirmDelay={goNext}
      bind:delayInSeconds
    />
  {/if}
  {#if currentStep.name === "ConfirmSnsDissolveDelay"}
    <ConfirmSnsDissolveDelay
      confirmButtonText={$i18n.neurons.confirm_update_delay}
      {neuron}
      {token}
      {delayInSeconds}
      {reloadNeuron}
      on:nnsUpdated={closeModal}
      on:nnsBack={modal.back}
    />
  {/if}
</WizardModal>
