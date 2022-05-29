<script lang="ts">
  // TODO: Rename file
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import StakeNeuron from "../../components/neurons/StakeNeuron.svelte";
  import SetDissolveDelay from "../../components/neurons/SetDissolveDelay.svelte";
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import ConfirmDissolveDelay from "../../components/neurons/ConfirmDissolveDelay.svelte";
  import EditFollowNeurons from "../../components/neurons/EditFollowNeurons.svelte";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import { stepIndex } from "../../utils/step.utils";
  import { createEventDispatcher, tick } from "svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import AddUserToHotkeys from "../../components/neurons/AddUserToHotkeys.svelte";
  import { isAccountHardwareWallet } from "../../utils/accounts.utils";
  import { definedNeuronsStore } from "../../stores/neurons.store";

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

  let newNeuronId: NeuronId | undefined;
  let newNeuron: NeuronInfo | undefined;
  $: newNeuron = $definedNeuronsStore.find(
    ({ neuronId }) => neuronId === newNeuronId
  );

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  type InvalidState = {
    stepName: string;
    isNeuronIdInvalid?: (n?: NeuronId) => boolean;
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
      isNeuronIdInvalid: (neuronId?: NeuronId) => neuronId === undefined,
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
      ({ stepName, isNeuronInvalid, isAccountInvalid, isNeuronIdInvalid }) => {
        return (
          stepName === currentStep?.name &&
          ((isNeuronInvalid?.(newNeuron) ?? false) ||
            (isAccountInvalid?.(selectedAccount) ?? false) ||
            (isNeuronIdInvalid?.(newNeuronId) ?? false))
        );
      }
    );
    if (invalidState !== undefined) {
      toastsStore.error({
        labelKey: "error.unknown",
      });
      close();
    }
  }
  let delayInSeconds: number = 0;

  const chooseAccount = async ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    selectedAccount = detail.selectedAccount;
    if (isAccountHardwareWallet(selectedAccount)) {
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
  const onNeuronCreated = async ({
    detail,
  }: CustomEvent<{ neuronId: NeuronId }>) => {
    newNeuronId = detail.neuronId;
    if (isAccountHardwareWallet(selectedAccount)) {
      toastsStore.show({
        labelKey: "neurons.neuron_create_success",
        level: "success",
      });
    }
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
      <StakeNeuron
        account={selectedAccount}
        on:nnsNeuronCreated={onNeuronCreated}
      />
    {/if}
  {/if}
  {#if currentStep?.name === "AddUserToHotkeys"}
    <!-- we spare a spinner for the selectedAccount and newNeuron within AddUserToHotkeys -->
    {#if selectedAccount !== undefined && newNeuronId !== undefined}
      <AddUserToHotkeys
        on:nnsHotkeyAdded={goNext}
        on:nnsSkip={close}
        account={selectedAccount}
        neuronId={newNeuronId}
      />
    {/if}
  {/if}
  {#if currentStep?.name === "SetDissolveDelay"}
    {#if newNeuron !== undefined}
      <SetDissolveDelay
        cancelButtonText={$i18n.neurons.skip}
        confirmButtonText={$i18n.neurons.set_delay}
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
        confirmButtonText={$i18n.neurons.confirm_set_delay}
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
