<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { accountsStore } from "../../stores/accounts.store";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
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
</script>

<Card>
  <h3>{$i18n.neuron_detail.hotkeys_title}</h3>
  <p>{$i18n.neuron_detail.no_notkeys}</p>
  <div class="actions">
    {#if isControllable}
      <AddHotkeyButton neuronId={neuron.neuronId} />
    {/if}
  </div>
</Card>

<style lang="scss">
  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
