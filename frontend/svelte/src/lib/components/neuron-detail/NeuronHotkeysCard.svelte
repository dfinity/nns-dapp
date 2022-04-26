<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { Principal } from "@dfinity/principal";
  import { removeHotkey } from "../../services/neurons.services";
  import { accountsStore } from "../../stores/accounts.store";
  import { authStore } from "../../stores/auth.store";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import { isNeuronControllable } from "../../utils/neuron.utils";
  import Card from "../ui/Card.svelte";
  import AddHotkeyButton from "./actions/AddHotkeyButton.svelte";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });
  let hotkeys: string[];
  $: hotkeys = neuron.fullNeuron?.hotKeys ?? [];

  const remove = async (hotkey: string) => {
    startBusy("remove-hotkey-neuron");
    let principal: Principal | undefined = undefined;
    try {
      principal = Principal.fromText(hotkey);
      await removeHotkey({ neuronId: neuron.neuronId, principal });
      toastsStore.show({
        level: "info",
        labelKey: "neuron_detail.remove_hotkey_success",
      });
    } catch {
      // Edge case, current hotkeys should be valid principals.
      toastsStore.error({
        labelKey: "neuron_detail.remove_hotkey_error",
      });
    } finally {
      stopBusy("remove-hotkey-neuron");
    }
  };
</script>

<Card>
  <h3>{$i18n.neuron_detail.hotkeys_title}</h3>
  {#if hotkeys.length === 0}
    <p>{$i18n.neuron_detail.no_notkeys}</p>
  {:else}
    <ul>
      {#each hotkeys as hotkey}
        <li>
          <span>{hotkey}</span><button
            on:click={() => remove(hotkey)}
            data-tid="remove-hotkey-button">x</button
          >
        </li>
      {/each}
    </ul>
  {/if}
  {#if isControllable}
    <div class="actions">
      <AddHotkeyButton neuronId={neuron.neuronId} />
    </div>
  {/if}
</Card>

<style lang="scss">
  .actions {
    display: flex;
    justify-content: flex-end;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin-bottom: var(--padding-2x);
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
