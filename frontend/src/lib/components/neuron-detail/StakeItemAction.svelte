<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";
  import UniverseLogo from "../universe/UniverseLogo.svelte";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
  import NnsIncreaseStakeButton from "./actions/NnsIncreaseStakeButton.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { formatToken } from "$lib/utils/token.utils";

  export let neuron: NeuronInfo;
</script>

<ItemAction>
  <UniverseLogo
    slot="icon"
    size="big"
    universe={NNS_UNIVERSE}
    framed
    horizontalPadding={false}
  />
  <div class="content">
    <p class="icp-value">
      <span>{formatToken({ value: neuronStake(neuron) })}</span><span
        >{ICPToken.symbol}</span
      >
    </p>
    <p class="description">{$i18n.neurons.ic_stake}</p>
  </div>
  <NnsIncreaseStakeButton slot="actions" variant="secondary" />
</ItemAction>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

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
