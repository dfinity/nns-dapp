<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import IconInfo from "../../icons/IconInfo.svelte";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
  import { formatPercentage } from "../../utils/format.utils";
  import CardInfo from "../ui/CardInfo.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import MergeMaturityButton from "./actions/MergeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import {
    isNeuronControllable,
    maturityByStake,
  } from "../../utils/neuron.utils";
  import { accountsStore } from "../../stores/accounts.store";

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
    <h3>{formatPercentage(maturityByStake(neuron))}</h3>
  </div>
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

  .actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--padding);
  }
</style>
