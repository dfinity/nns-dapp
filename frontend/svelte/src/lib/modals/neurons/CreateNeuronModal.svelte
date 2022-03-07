<script lang="ts">
  // TODO: Rename file
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { accountsStore } from "../../stores/accounts.store";
  import { createEventDispatcher, onDestroy } from "svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import StakeNeuron from "./StakeNeuron.svelte";
  import type { Unsubscriber } from "svelte/store";
  import Transition from "../../components/ui/Transition.svelte";
  import { StepsState } from "../../services/stepsState.services";
  import SetDissolveDelay from "./SetDissolveDelay.svelte";
  import type { NeuronId } from "@dfinity/nns";

  enum Steps {
    SelectAccount,
    StakeNeuron,
    SetDissolveDelay,
  }
  let stateStep = new StepsState<typeof Steps>(Steps);

  // TODO: Get all the accounts and be able to select one.
  let selectedAccount: Account | undefined;
  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      selectedAccount = accountStore?.main;
    }
  );

  let newNeuronId: NeuronId;

  const chooseAccount = () => {
    stateStep = stateStep.next();
  };
  const goBack = () => {
    stateStep = stateStep.back();
  };
  const goToDissolveDelay = (event: CustomEvent<{ neuronId: NeuronId }>) => {
    newNeuronId = event.detail.neuronId;
    stateStep = stateStep.next();
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
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[currentStep];

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };
</script>

<Modal
  on:nnsClose
  theme="dark"
  size="medium"
  showBackButton={currentStep === Steps.StakeNeuron}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons?.[titleKey]}</span>
  <main>
    <!-- TODO: Manage edge case: https://dfinity.atlassian.net/browse/L2-329 -->
    {#if currentStep === Steps.SelectAccount && selectedAccount}
      <Transition {diff}>
        <SelectAccount
          main={selectedAccount}
          on:nnsSelectAccount={chooseAccount}
        />
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
    {#if currentStep === Steps.SetDissolveDelay && newNeuronId}
      <Transition {diff}>
        <!-- TODO: Edit Followees https://dfinity.atlassian.net/browse/L2-337 -->
        <SetDissolveDelay neuronId={newNeuronId} on:nnsNext={close} />
      </Transition>
    {/if}
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));
  }
</style>
