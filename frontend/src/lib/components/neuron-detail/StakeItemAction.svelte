<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";
  import UniverseLogo from "../universe/UniverseLogo.svelte";
  import type { Token } from "@dfinity/utils";
  import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Universe } from "$lib/types/universe";
  import { formatToken } from "$lib/utils/token.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let universe: Universe;
  export let token: Token;
  export let neuronStake: bigint;
  export let isIncreaseStakeAllowed = true;
</script>

<ItemAction testId="stake-item-action-component">
  <UniverseLogo
    slot="icon"
    size="big"
    {universe}
    framed
    horizontalPadding={false}
  />
  <div class="content">
    <h4 class="token-value">
      <span data-tid="stake-value">{formatToken({ value: neuronStake })}</span
      ><span data-tid="token-symbol">{token.symbol}</span>
    </h4>
    <p class="description" data-tid="staked-description">
      {replacePlaceholders($i18n.neurons.ic_stake, { $token: token.symbol })}
    </p>
  </div>
  <svelte:fragment slot="actions">
    {#if isIncreaseStakeAllowed}
      <IncreaseStakeButton variant="secondary" on:increaseStake />
    {/if}
  </svelte:fragment>
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
