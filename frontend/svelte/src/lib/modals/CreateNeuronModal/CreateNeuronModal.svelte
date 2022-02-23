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

  enum Steps {
    SelectAccount,
    StakeNeuron,
  }
  let stateStep = new StepsState<typeof Steps>(Steps);

  // TODO: Get all the accounts and be able to select one.
  let selectedAccount: Account | undefined;
  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      selectedAccount = accountStore?.main;
    }
  );

  const chooseAccount = () => {
    stateStep = stateStep.next();
  };
  const goBack = () => {
    stateStep = stateStep.back();
  };

  onDestroy(unsubscribeAccounts);

  let currentStep: number;
  let diff: number;
  $: currentStep = stateStep.currentStep;
  $: diff = stateStep.diff;

  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[currentStep];
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
    {#if currentStep === Steps.SelectAccount}
      <Transition {diff}>
        <SelectAccount
          main={selectedAccount}
          on:nnsSelectAccount={chooseAccount}
        />
      </Transition>
    {/if}
    {#if currentStep === Steps.StakeNeuron && selectedAccount}
      <Transition {diff}>
        <StakeNeuron account={selectedAccount} />
      </Transition>
    {/if}
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));
  }
</style>
