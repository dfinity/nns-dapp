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

  export let visible: boolean;

  enum Steps {
    SelectAccount,
    StakeNeuron,
  }
  let stateStep = new StepsState(Steps);

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

  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[stateStep.currentStep];
</script>

<Modal
  {visible}
  on:nnsClose
  theme="dark"
  size="medium"
  showBackButton={stateStep.currentStep === Steps.StakeNeuron}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons?.[titleKey]}</span>
  <main>
    {#if stateStep.currentStep === Steps.SelectAccount}
      <Transition diff={stateStep.diff}>
        <SelectAccount
          main={selectedAccount}
          on:nnsSelectAccount={chooseAccount}
        />
      </Transition>
    {/if}
    {#if stateStep.currentStep === Steps.StakeNeuron && selectedAccount}
      <Transition diff={stateStep.diff}>
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
