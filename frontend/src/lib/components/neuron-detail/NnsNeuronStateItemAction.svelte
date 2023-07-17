<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import {
    ageMultiplier,
    getStateInfo,
    neuronAgeBonus,
    type StateInfo,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import DisburseButton from "./actions/DisburseButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let neuron: NeuronInfo;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(neuron.state);

  let ageBonus: number;
  $: ageBonus = ageMultiplier(neuron.ageSeconds);
</script>

<ItemAction testId="nns-neuron-state-item-action-component">
  <svelte:fragment slot="icon">
    {#if stateInfo !== undefined}
      <div class="icon">
        <svelte:component this={stateInfo.Icon} />
      </div>
    {/if}
  </svelte:fragment>
  <div class="content">
    <h4 class="icp-value" data-tid="state-text">
      {keyOf({ obj: $i18n.neuron_state, key: NeuronState[neuron.state] })}
    </h4>
    {#if neuron.state === NeuronState.Locked}
      <Tooltip id="neuron-age-bonus" text={ageBonus.toFixed(8)}>
        <p class="description" data-tid="age-bonus-text">
          {replacePlaceholders($i18n.neuron_detail.age_bonus_label, {
            $ageBonus: ageBonus.toFixed(2),
          })}
        </p>
      </Tooltip>
    {:else}
      <p class="description" data-tid="age-bonus-text">
        {$i18n.neuron_detail.no_age_bonus}
      </p>
    {/if}
  </div>
  <svelte:fragment slot="actions">
    {#if neuron.state === NeuronState.Dissolved}
      <DisburseButton />
    {:else}
      <DissolveActionButton neuronState={neuron.state} />
    {/if}
  </svelte:fragment>
</ItemAction>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .icon {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
    background: var(--content-background);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    p,
    h4 {
      margin: 0;
    }
  }

  .icp-value {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }
</style>
