<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getSnsLockedTimeInSeconds } from "$lib/utils/sns-neuron.utils";
  import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
  import type { Token } from "@dfinity/utils";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import type { Principal } from "@dfinity/principal";
  import { updateDelay } from "$lib/services/sns-neurons.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { loadSnsParameters } from "$lib/services/sns-parameters.services";
  import SetSnsDissolveDelay from "$lib/components/sns-neurons/SetSnsDissolveDelay.svelte";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";

  export let rootCanisterId: Principal;
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

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  let delayInSeconds = Number(getSnsLockedTimeInSeconds(neuron) ?? 0n);

  $: if ($snsOnlyProjectStore !== undefined) {
    loadSnsParameters($snsOnlyProjectStore);
  }

  const dispatcher = createEventDispatcher();
  const goNext = () => {
    modal.next();
  };
  const closeModal = () => dispatcher("nnsClose");
  const updateDissolveDelay = async () => {
    try {
      startBusy({
        initiator: "dissolve-sns-action",
      });

      const { success } = await updateDelay({
        rootCanisterId,
        neuron,
        dissolveDelaySeconds: delayInSeconds,
      });

      await reloadNeuron();

      stopBusy("dissolve-sns-action");

      if (success) {
        dispatcher("nnsUpdated");
      }
    } catch (err) {
      toastsError({
        labelKey: "error__sns.sns_dissolve_delay_action",
        err,
      });
    }

    closeModal();
  };
</script>

<WizardModal
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
  testId="increase-sns-dissolve-delay-modal-component"
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>
  {#if currentStep?.name === "SetSnsDissolveDelay"}
    <SetSnsDissolveDelay
      {rootCanisterId}
      {neuron}
      {token}
      on:nnsCancel={closeModal}
      on:nnsConfirmDelay={goNext}
      bind:delayInSeconds
    >
      <svelte:fragment slot="cancel">{$i18n.core.cancel}</svelte:fragment>
      <svelte:fragment slot="confirm"
        >{$i18n.neurons.update_delay}</svelte:fragment
      >
    </SetSnsDissolveDelay>
  {/if}
  {#if currentStep?.name === "ConfirmSnsDissolveDelay"}
    <ConfirmSnsDissolveDelay
      {rootCanisterId}
      {neuron}
      {token}
      {delayInSeconds}
      on:nnsConfirm={updateDissolveDelay}
      on:nnsBack={modal.back}
    />
  {/if}
</WizardModal>
