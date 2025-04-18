<script lang="ts">
  import HardwareWalletNeuronAddHotkeyButton from "$lib/components/accounts/HardwareWalletNeuronAddHotkeyButton.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type {
    HardwareWalletNeuronInfo,
    WalletContext,
  } from "$lib/types/wallet.context";
  import { WALLET_CONTEXT_KEY } from "$lib/types/wallet.context";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { getContext } from "svelte";

  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;

  let neurons: HardwareWalletNeuronInfo[] = [];

  $: ({ neurons } = $store);
</script>

<p>{$i18n.accounts.attach_hardware_neurons_text}</p>

<div class="table">
  <p>{$i18n.neurons.neuron_id}</p>
  <p class="stake_amount">{$i18n.neurons.stake_amount}</p>

  {#each neurons as { neuronId, controlledByNNSDapp, fullNeuron } (neuronId)}
    <p>
      {neuronId}
    </p>

    <p>
      {formatTokenE8s({ value: fullNeuron?.cachedNeuronStake ?? 0n })}
    </p>

    <p class="hotkey">
      {#if controlledByNNSDapp}
        {$i18n.accounts.attach_hardware_neurons_added}
      {:else}
        <HardwareWalletNeuronAddHotkeyButton {neuronId} />
      {/if}
    </p>
  {/each}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .table {
    display: grid;
    grid-template-columns: repeat(2, calc((100% - var(--padding-2x)) / 2));
    grid-gap: var(--padding);
    width: 100%;

    padding: var(--padding-2x) 0 0;

    p {
      word-break: break-word;
      margin: 0;

      display: inline-flex;
      align-items: center;

      /** minimal height of the button displayed in the grid - determined by observation */
      min-height: calc(var(--button-min-height) / 3);
    }

    @include media.min-width(medium) {
      grid-gap: var(--padding-2x);
      grid-template-columns: repeat(
        3,
        calc((100% - (2 * var(--padding-2x))) / 3)
      );
    }
  }

  .stake_amount {
    @include media.min-width(medium) {
      grid-column: 2 / 4;
    }
  }

  .hotkey {
    grid-column: 1 / 3;
    padding: 0 0 var(--padding-2x);
    font-size: var(--font-size-small);

    justify-self: center;

    @include media.min-width(medium) {
      grid-column: auto;
      padding: 0;
      font-size: inherit;
      justify-self: inherit;
    }
  }
</style>
