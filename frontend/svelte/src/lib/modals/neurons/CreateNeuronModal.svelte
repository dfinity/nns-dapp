<script lang="ts">
  // TODO: Rename file
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { accountsStore } from "../../stores/accounts.store";
  import { onDestroy } from "svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import StakeNeuron from "./StakeNeuron.svelte";
  import type { Unsubscriber } from "svelte/store";
  import Transition from "../../components/ui/Transition.svelte";
  import { StepsState } from "../../services/stepsState.services";
  import SetDissolveDelay from "./SetDissolveDelay.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { neuronsStore } from "../../stores/neurons.store";
  import ConfirmDissolveDelay from "./ConfirmDissolveDelay.svelte";
  import EditFollowNeurons from "./EditFollowNeurons.svelte";

  enum Steps {
    SelectAccount,
    StakeNeuron,
    SetDissolveDelay,
    ConfirmDisseolveDelay,
    EditFolloNeurons,
  }
  let stateStep = new StepsState<typeof Steps>(Steps);

  let selectedAccount: Account | undefined;
  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      selectedAccount = accountStore?.main;
    }
  );

  let newNeuronId: NeuronId | undefined;
  let newNeuron: NeuronInfo | undefined;
  $: newNeuron = $neuronsStore.find(({ neuronId }) => newNeuronId === neuronId);
  let delayInSeconds: number = 0;
  let showBackButton: boolean;
  $: showBackButton = [Steps.StakeNeuron, Steps.ConfirmDisseolveDelay].includes(
    currentStep
  );

  const chooseAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    selectedAccount = detail.selectedAccount;
    stateStep = stateStep.next();
  };
  const goBack = () => {
    stateStep = stateStep.back();
  };
  const goNext = () => {
    stateStep = stateStep.next();
  };
  const goToDissolveDelay = ({
    detail,
  }: CustomEvent<{ neuronId: NeuronId }>) => {
    newNeuronId = detail.neuronId;
    stateStep = stateStep.next();
  };
  const goEditFollowers = () => {
    stateStep = stateStep.set(Steps.EditFolloNeurons);
  };

  onDestroy(unsubscribeAccounts);

  let currentStep: number;
  let diff: number;
  $: currentStep = stateStep.currentStep;
  $: diff = stateStep.diff;

  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
    "2": "set_dissolve_delay",
    "3": "confirm_dissolve_delay",
    "4": "follow_neurons_screen",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[currentStep];
</script>

<Modal
  on:nnsClose
  theme="dark"
  size="medium"
  {showBackButton}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons?.[titleKey]}</span>
  <main>
    <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
    {#if currentStep === Steps.SelectAccount && selectedAccount}
      <Transition {diff}>
        <SelectAccount on:nnsSelectAccount={chooseAccount} />
      </Transition>
    {/if}
    <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
    {#if currentStep === Steps.StakeNeuron && selectedAccount}
      <Transition {diff}>
        <StakeNeuron
          account={selectedAccount}
          on:nnsNeuronCreated={goToDissolveDelay}
        />
      </Transition>
    {/if}
    <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
    {#if currentStep === Steps.SetDissolveDelay && newNeuron}
      <Transition {diff}>
        <SetDissolveDelay
          neuron={newNeuron}
          on:nnsSkipDelay={goEditFollowers}
          on:nnsConfirmDelay={goNext}
          bind:delayInSeconds
        />
      </Transition>
    {/if}
    <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
    {#if currentStep === Steps.ConfirmDisseolveDelay && newNeuron && delayInSeconds}
      <Transition {diff}>
        <ConfirmDissolveDelay
          neuron={newNeuron}
          {delayInSeconds}
          on:back={goBack}
          on:nnsNext={goNext}
        />
      </Transition>
    {/if}
    <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
    {#if currentStep === Steps.EditFolloNeurons && newNeuron}
      <Transition {diff}>
        <EditFollowNeurons neuron={newNeuron} />
      </Transition>
    {/if}
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));
  }
</style>
