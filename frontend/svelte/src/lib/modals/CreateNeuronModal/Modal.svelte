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
  import {
    initWizardStore,
    State as WizardState,
  } from "../../stores/wizard.store";
  import Transition from "../../components/ui/Transition.svelte";

  export let visible: boolean;

  const wizardStore = initWizardStore();
  enum Steps {
    SelectAccount,
    StakeNeuron,
  }

  // TODO: Get all the accounts and be able to select one.
  let selectedAccount: Account | undefined;
  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      selectedAccount = accountStore?.main;
    }
  );

  let wizardState: WizardState;
  // No need to unsubscribe, when the component is unmounted, this store instance also disappears
  wizardStore.subscribe((value) => (wizardState = value));
  let currentStep: number = 0;
  $: currentStep = wizardState.currentIndex;
  let diffIndex: number = 0;
  $: diffIndex = wizardState.currentIndex - wizardState.previousIndex;
  const chooseAccount = () => {
    // TODO: Apply account selection
    wizardStore.next();
  };
  const goBack = () => {
    wizardStore.back();
  };

  onDestroy(unsubscribeAccounts);

  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[currentStep];
</script>

<Modal
  {visible}
  on:nnsClose
  theme="dark"
  size="medium"
  showBackButton={currentStep === Steps.StakeNeuron}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons?.[titleKey]}</span>
  <main>
    {#if currentStep === Steps.SelectAccount}
      <Transition diff={diffIndex}>
        <SelectAccount
          main={selectedAccount}
          on:nnsSelectAccount={chooseAccount}
        />
      </Transition>
    {/if}
    {#if currentStep === Steps.StakeNeuron && selectedAccount}
      <Transition diff={diffIndex}>
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
