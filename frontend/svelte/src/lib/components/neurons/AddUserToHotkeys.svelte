<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import { getIdentity } from "../../services/auth.services";
  import { addHotkeyFromHW } from "../../services/neurons.services";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import { neuronStake } from "../../utils/neuron.utils";
  import Spinner from "../ui/Spinner.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import type { Account } from "../../types/account";
  import type { NeuronInfo } from "@dfinity/nns";

  export let account: Account;
  export let neuron: NeuronInfo;

  let loading: boolean = false;

  let principal: Principal | undefined;
  onMount(async () => {
    principal = (await getIdentity()).getPrincipal();
  });

  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  const dispatcher = createEventDispatcher();
  const dispatchNext = () => {
    dispatcher("nnsNext");
  };

  const addCurrentUserToHotkey = async () => {
    loading = true;
    startBusy("add-hotkey-neuron");
    const identity = await getIdentity();
    const neuronId = await addHotkeyFromHW({
      neuronId: neuron.neuronId,
      principal: identity.getPrincipal(),
      accountIdentifier: account.identifier,
    });
    loading = false;
    stopBusy("add-hotkey-neuron");
    if (neuronId !== undefined) {
      toastsStore.success({
        labelKey: "neurons.add_user_as_hotkey_success",
      });
      dispatchNext();
    }
  };
</script>

<div class="wizard-wrapper" data-tid="add-principal-to-hotkeys-modal">
  <div class="main-info">
    <h5>{$i18n.neurons.add_user_as_hotkey_message_1}</h5>
    <p data-tid="neuron-stake">
      {replacePlaceholders($i18n.neurons.add_user_as_hotkey_message_2, {
        $principal: principal?.toText() ?? "",
      })}
    </p>
  </div>
  <div class="info">
    <h5>{$i18n.neurons.neuron_id}</h5>
    <p>{neuron.neuronId}</p>
    <h5>{$i18n.neurons.neuron_balance}</h5>
    <p data-tid="neuron-stake">
      {replacePlaceholders($i18n.neurons.icp_stake, {
        $amount: formatICP(neuronICP),
      })}
    </p>
  </div>
  <div class="buttons">
    <button
      on:click={dispatchNext}
      data-tid="skip-add-principal-to-hotkey-modal"
      class="secondary full-width">{$i18n.neurons.skip}</button
    >
    <button
      class="primary full-width"
      on:click={addCurrentUserToHotkey}
      data-tid="confirm-add-principal-to-hotkey-modal"
      disabled={principal === undefined}
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.neuron_detail.add_hotkey}
      {/if}
    </button>
  </div>
</div>

<style lang="scss">
  .main-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--padding-3x) 0;

    h5,
    p {
      text-align: center;
    }
  }

  .info {
    flex-grow: 1;
  }

  .buttons {
    display: flex;
    gap: var(--padding);
  }
</style>
