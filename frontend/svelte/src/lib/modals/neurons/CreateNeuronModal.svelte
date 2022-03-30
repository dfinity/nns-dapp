<script lang="ts">
  // TODO: Rename file
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import StakeNeuron from "../../components/neurons/StakeNeuron.svelte";
  import SetDissolveDelay from "../../components/neurons/SetDissolveDelay.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { neuronsStore } from "../../stores/neurons.store";
  import ConfirmDissolveDelay from "../../components/neurons/ConfirmDissolveDelay.svelte";
  import EditFollowNeurons from "../../components/neurons/EditFollowNeurons.svelte";
  import WizardModal from "../WizardModal.svelte";
  import type { Steps } from "../../stores/steps.state";
  import { stepIndex } from "../../utils/step.utils";

  const steps: Steps = [
    { name: "SelectAccount", showBackButton: false },
    { name: "StakeNeuron", showBackButton: true },
    { name: "SetDissolveDelay", showBackButton: false },
    { name: "ConfirmDissolveDelay", showBackButton: true },
    { name: "EditFollowNeurons", showBackButton: false },
  ];

  let currentStepIndex: number;
  let modal: WizardModal;

  let selectedAccount: Account | undefined;

  let newNeuronId: NeuronId | undefined;
  let newNeuron: NeuronInfo | undefined;
  $: newNeuron = $neuronsStore.find(({ neuronId }) => newNeuronId === neuronId);
  let delayInSeconds: number = 0;

  const chooseAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    selectedAccount = detail.selectedAccount;
    modal.next();
  };
  const goBack = () => {
    modal.back();
  };
  const goNext = () => {
    modal.next();
  };
  const goToDissolveDelay = ({
    detail,
  }: CustomEvent<{ neuronId: NeuronId }>) => {
    newNeuronId = detail.neuronId;
    modal.next();
  };
  const goEditFollowers = () => {
    modal.set(stepIndex({ name: "EditFollowNeurons", steps }));
  };

  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
    "2": "set_dissolve_delay",
    "3": "confirm_dissolve_delay",
    "4": "follow_neurons_screen",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[currentStepIndex];
</script>

<WizardModal {steps} bind:currentStepIndex bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{$i18n.neurons?.[titleKey]}</svelte:fragment>

  <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
  {#if currentStepIndex === stepIndex({ name: "SelectAccount", steps })}
    <SelectAccount on:nnsSelectAccount={chooseAccount} />
  {/if}
  <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
  {#if currentStepIndex === stepIndex({ name: "StakeNeuron", steps })}
    {#if selectedAccount !== undefined}
      <StakeNeuron
        account={selectedAccount}
        on:nnsNeuronCreated={goToDissolveDelay}
      />
    {/if}
  {/if}
  <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
  {#if currentStepIndex === stepIndex({ name: "SetDissolveDelay", steps })}
    <SetDissolveDelay
      neuron={newNeuron}
      on:nnsSkipDelay={goEditFollowers}
      on:nnsConfirmDelay={goNext}
      bind:delayInSeconds
    />
  {/if}
  <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
  {#if currentStepIndex === stepIndex({ name: "ConfirmDissolveDelay", steps })}
    <ConfirmDissolveDelay
      neuron={newNeuron}
      {delayInSeconds}
      on:back={goBack}
      on:nnsNext={goNext}
    />
  {/if}
  <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
  {#if currentStepIndex === stepIndex({ name: "EditFollowNeurons", steps })}
    <EditFollowNeurons neuron={newNeuron} />
  {/if}
</WizardModal>
