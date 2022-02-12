<script lang="ts">
  import Wizard from "../../components/ui/Wizard/Wizard.svelte";
  import WizardStep from "../../components/ui/Wizard/WizardStep.svelte";
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { accountsStore } from "../../stores/accounts.store";
  import { onDestroy, onMount } from "svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import StakeNeuron from "./StakeNeuron.svelte";
  import type { Unsubscriber } from "svelte/store";
  import { wizardStore } from "../../components/ui/Wizard/wizardStore";

  export let visible: boolean;

  // TODO: Get all the accounts and be able to select one.
  let selectedAccount: Account | undefined;
  const unsubscribeAccounts: Unsubscriber = accountsStore.subscribe(
    (accountStore) => {
      selectedAccount = accountStore?.main;
    }
  );

  let currentIndex: number = 0;
  let unsubscribeWizard: Unsubscriber = wizardStore.subscribe((value) => {
    currentIndex = value;
  });
  const chooseAccount = () => {
    // TODO: Apply account selection
    wizardStore.next();
  };
  const goBack = () => {
    wizardStore.back();
  };

  onDestroy(() => {
    unsubscribeWizard();
    unsubscribeAccounts();
  });

  let titleKey: string = "select_source";
  const titleMapper: Record<string, string> = {
    "0": "select_source",
    "1": "stake_neuron",
  };
  $: titleKey = titleMapper[currentIndex];
</script>

<!-- Only the second step (index 1) is allowed to go back -->
<Modal
  {visible}
  on:nnsClose
  theme="dark"
  size="medium"
  showBackButton={currentIndex === 1}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons?.[titleKey]}</span>
  <main>
    <Wizard>
      <WizardStep index={0}>
        <SelectAccount
          main={selectedAccount}
          on:nnsSelectAccount={chooseAccount}
        />
      </WizardStep>
      <WizardStep index={1}>
        {#if selectedAccount}
          <StakeNeuron account={selectedAccount} />
        {/if}
      </WizardStep>
    </Wizard>
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));
  }
</style>
