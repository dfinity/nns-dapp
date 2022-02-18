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
  import { initWizardStore } from "../../stores/wizard.store";
  import Transition from "../../components/ui/Transition.svelte";
  import { StepsState } from "../../stores/StepsState";

  export let visible: boolean;

  enum Steps {
    SelectAccount,
    StakeNeuron,
  }
  const wizardStore = initWizardStore(Steps);
  let stateStep = new StepsState(Steps);

  // TODO: Get all the accounts and be able to select one.
  let selectedAccount: Account | undefined;
  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      selectedAccount = accountStore?.main;
    }
  );

  const chooseAccount = () => {
    // TODO: Apply account selection
    wizardStore.next();
    // stateStep = stateStep.next();
  };
  const goBack = () => {
    wizardStore.back();
    // stateStep = stateStep.back();
  };

  onDestroy(unsubscribeAccounts);

  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
  };
  let titleKey: string = titleMapper[0];
  $: titleKey = titleMapper[stateStep.currentIndex];
</script>

<Modal
  {visible}
  on:nnsClose
  theme="dark"
  size="medium"
  showBackButton={$wizardStore.currentIndex === Steps.StakeNeuron}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons?.[titleKey]}</span>
  <main>
    {#if $wizardStore.currentIndex === Steps.SelectAccount}
      <Transition diff={wizardStore.diff()}>
        <SelectAccount
          main={selectedAccount}
          on:nnsSelectAccount={chooseAccount}
        />
      </Transition>
    {/if}
    {#if $wizardStore.currentIndex === Steps.StakeNeuron && selectedAccount}
      <Transition diff={wizardStore.diff()}>
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
