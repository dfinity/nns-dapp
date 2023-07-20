<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";
  import UniverseLogo from "../universe/UniverseLogo.svelte";
  import type { Token } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { formatToken } from "$lib/utils/token.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import { getSnsNeuronStake } from "$lib/utils/sns-neuron.utils";
  import SnsIncreaseStakeButton from "./actions/SnsIncreaseStakeButton.svelte";
  import type { Universe } from "$lib/types/universe";

  export let neuron: SnsNeuron;
  export let token: Token;
  export let universe: Universe;
</script>

<ItemAction testId="sns-stake-item-action-component">
  <UniverseLogo
    slot="icon"
    size="big"
    {universe}
    framed
    horizontalPadding={false}
  />
  <div class="content">
    <h4 class="token-value">
      <span data-tid="stake-value"
        >{formatToken({ value: getSnsNeuronStake(neuron) })}</span
      ><span>{token.symbol}</span>
    </h4>
    <p class="description">{$i18n.neurons.ic_stake}</p>
  </div>
  <SnsIncreaseStakeButton slot="actions" variant="secondary" />
</ItemAction>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    p,
    h4 {
      margin: 0;
    }
  }

  .token-value {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }
</style>
