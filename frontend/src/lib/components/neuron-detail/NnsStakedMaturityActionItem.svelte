<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formattedStakedMaturity } from "$lib/utils/neuron.utils";
  import { IconExpandCircleDown, ItemAction } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsStakeMaturityButton from "./actions/NnsStakeMaturityButton.svelte";

  export let neuron: NeuronInfo;
</script>

<ItemAction testId="nns-staked-maturity-item-action-component">
  <div slot="icon" class="icon">
    <!-- TODO: Use icon from gix-components and fix icon size -->
    <IconExpandCircleDown />
  </div>
  <div class="content">
    <p data-tid="staked-maturity">{formattedStakedMaturity(neuron)}</p>
    <p class="description">{$i18n.neuron_detail.staked_description}</p>
  </div>
  <NnsStakeMaturityButton {neuron} slot="actions" />
</ItemAction>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    p {
      margin: 0;
    }
  }

  .icon {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
    background: var(--content-background);
  }
</style>
