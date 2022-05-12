<script lang="ts">
  // TODO: Rename file
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import StakeNeuron from "../../components/neurons/StakeNeuron.svelte";
  import SetDissolveDelay from "../../components/neurons/SetDissolveDelay.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import ConfirmDissolveDelay from "../../components/neurons/ConfirmDissolveDelay.svelte";
  import EditFollowNeurons from "../../components/neurons/EditFollowNeurons.svelte";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import { stepIndex } from "../../utils/step.utils";
  import { createEventDispatcher, tick } from "svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import AddUserToHotkeys from "../../components/neurons/AddUserToHotkeys.svelte";
  import { isHardwareWallet } from "../../utils/accounts.utils";

  const lastSteps: Steps = [
    {
      name: "SetDissolveDelay",
      showBackButton: false,
      title: $i18n.neurons.set_dissolve_delay,
    },
    {
      name: "ConfirmDissolveDelay",
      showBackButton: true,
      title: $i18n.neurons.confirm_dissolve_delay,
    },
    {
      name: "EditFollowNeurons",
      showBackButton: false,
      title: $i18n.neurons.follow_neurons_screen,
    },
  ];

  const extraStepHW: Step = {
    name: "AddUserToHotkeys",
    showBackButton: false,
    title: $i18n.neurons.add_user_as_hotkey,
  };

  let steps: Steps = [
    {
      name: "SelectAccount",
      showBackButton: false,
      title: $i18n.accounts.select_source,
    },
    {
      name: "StakeNeuron",
      showBackButton: true,
      title: $i18n.neurons.stake_neuron,
    },
  ];

  let currentStep: Step | undefined;
  let modal: WizardModal;

  let selectedAccount: Account | undefined;

  let newNeuron: NeuronInfo | undefined;
  const dispatcher = createEventDispatcher();
  type InvalidState = {
    stepName: string;
    isNeuronInvalid?: (n?: NeuronInfo) => boolean;
    isAccountInvalid?: (a?: Account) => boolean;
  };
  const invalidStates: InvalidState[] = [
    {
      stepName: "StakeNeuron",
      isAccountInvalid: (account?: Account) => account === undefined,
    },
    {
      stepName: "AddUserToHotkeys",
      isAccountInvalid: (account?: Account) => account === undefined,
      isNeuronInvalid: (neuron?: NeuronInfo) => neuron === undefined,
    },
    {
      stepName: "SetDissolveDelay",
      isNeuronInvalid: (neuron?: NeuronInfo) => neuron === undefined,
    },
    {
      stepName: "ConfirmDissolveDelay",
      isNeuronInvalid: (neuron?: NeuronInfo) => neuron === undefined,
    },
    {
      stepName: "EditFollowNeurons",
      isNeuronInvalid: (neuron?: NeuronInfo) => neuron === undefined,
    },
  ];
  $: {
    const invalidState = invalidStates.find(
      ({ stepName, isNeuronInvalid, isAccountInvalid }) => {
        return (
          stepName === currentStep?.name &&
          ((isNeuronInvalid?.(newNeuron) ?? false) ||
            (isAccountInvalid?.(selectedAccount) ?? false))
        );
      }
    );
    if (invalidState !== undefined) {
      toastsStore.error({
        labelKey: "error.unknown",
      });
      dispatcher("nnsClose");
    }
  }
  let delayInSeconds: number = 0;

  const chooseAccount = async ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    selectedAccount = detail.selectedAccount;
    if (isHardwareWallet(selectedAccount)) {
      steps.push(extraStepHW);
    }
    steps.push(...lastSteps);
    // Wait steps to be applied - components to be updated - before being able to navigate to next step
    await tick();
    modal.next();
  };
  const goNext = () => {
    modal.next();
  };
  const addNeuron = ({ detail }: CustomEvent<{ neuron: NeuronInfo }>) => {
    newNeuron = detail.neuron;
    modal.next();
  };
  const goEditFollowers = () => {
    modal.set(stepIndex({ name: "EditFollowNeurons", steps }));
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? $i18n.accounts.select_source}</svelte:fragment
  >
  {#if currentStep?.name === "SelectAccount"}
    <SelectAccount on:nnsSelectAccount={chooseAccount} />
  {/if}
  {#if currentStep?.name === "StakeNeuron"}
    <!-- we spare a spinner for the selectedAccount within StakeNeuron because we reach this step once the selectedAccount has been selected -->
    {#if selectedAccount !== undefined}
      <StakeNeuron account={selectedAccount} on:nnsNeuronCreated={addNeuron} />
    {/if}
  {/if}
  {#if currentStep?.name === "AddUserToHotkeys"}
    <!-- we spare a spinner for the selectedAccount and newNeuron within AddUserToHotkeys -->
    {#if selectedAccount !== undefined && newNeuron !== undefined}
      <AddUserToHotkeys
        on:nnsNext={goNext}
        account={selectedAccount}
        neuron={newNeuron}
      />
    {/if}
  {/if}
  {#if currentStep?.name === "SetDissolveDelay"}
    {#if newNeuron !== undefined}
      <SetDissolveDelay
        cancelButtonText={$i18n.neurons.skip}
        neuron={newNeuron}
        on:nnsCancel={goEditFollowers}
        on:nnsConfirmDelay={goNext}
        bind:delayInSeconds
      />
    {/if}
  {/if}
  {#if currentStep?.name === "ConfirmDissolveDelay"}
    {#if newNeuron !== undefined}
      <ConfirmDissolveDelay
        neuron={newNeuron}
        {delayInSeconds}
        on:nnsUpdated={goNext}
      />
    {/if}
  {/if}
  {#if currentStep?.name === "EditFollowNeurons"}
    {#if newNeuron !== undefined}
      <EditFollowNeurons neuron={newNeuron} />
    {/if}
  {/if}
</WizardModal>
