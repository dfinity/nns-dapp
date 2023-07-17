<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import {
    getAgeBonusText,
    getStateInfo,
    type StateInfo,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { keyOf } from "$lib/utils/utils";
  import DisburseButton from "./actions/DisburseButton.svelte";
  import DissolveActionButton from "./actions/DissolveActionButton.svelte";

  export let neuron: NeuronInfo;

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(neuron.state);

  let ageBonusText: string;
  $: ageBonusText = getAgeBonusText({ neuron, i18n: $i18n });
</script>

{#if stateInfo !== undefined}
  <ItemAction testId="nns-stake-item-action-component">
    <div slot="icon" class="icon">
      <!-- TODO: Use new icons -->
      <svelte:component this={stateInfo.Icon} />
    </div>
    <div class="content">
      <p class="icp-value">
        {keyOf({ obj: $i18n.neuron_state, key: NeuronState[neuron.state] })}
      </p>
      <p class="description">{ageBonusText}</p>
    </div>
    <svelte:fragment slot="actions">
      {#if neuron.state === NeuronState.Dissolved}
        <DisburseButton />
      {:else}
        <DissolveActionButton neuronState={neuron.state} />
      {/if}
    </svelte:fragment>
  </ItemAction>
{/if}

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

    p {
      margin: 0;
    }
  }

  .icp-value {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }
</style>
