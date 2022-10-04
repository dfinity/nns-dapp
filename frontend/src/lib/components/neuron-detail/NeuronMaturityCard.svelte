<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { IconInfo } from "@dfinity/gix-components";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import MergeMaturityButton from "./actions/MergeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import {
    formattedMaturity,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { accountsStore } from "$lib/stores/accounts.store";

  export let neuron: NeuronInfo;
  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });
</script>

<CardInfo>
  <div class="title" slot="start">
    <h3>{$i18n.neuron_detail.maturity_title}</h3>
    <Tooltip id="maturity-info" text={$i18n.neuron_detail.maturity_tooltip}>
      <span>
        <IconInfo />
      </span>
    </Tooltip>
  </div>
  <div slot="end">
    <h3>
      {formattedMaturity(neuron)}
    </h3>
  </div>
  <p>
    {@html $i18n.neuron_detail.maturity_description}
  </p>
  <div class="actions">
    {#if isControllable}
      <MergeMaturityButton {neuron} />
      <SpawnNeuronButton {neuron} />
    {/if}
  </div>
</CardInfo>

<style lang="scss">
  .title {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }

  p {
    margin: 0 0 var(--padding);

    :global(a) {
      font-size: inherit;
      color: var(--primary);
    }
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--padding);
  }
</style>
