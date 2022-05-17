<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { formatICP } from "../../utils/icp.utils";
  import { isHotKeyControllable } from "../../utils/neuron.utils";
  import { authStore } from "../../stores/auth.store";

  export let neurons: NeuronInfo[] = [];

  // TODO(L2-436):
  //  - display which neurons is attached to nns-dapp and which not
  //  - integrate with "attach hotkey for neuron" feature
</script>

<p>{$i18n.accounts.attach_hardware_neurons_text}</p>

<div class="table">
  <p>{$i18n.neurons.neuron_id}</p>
  <p class="stake_amount">{$i18n.neurons.stake_amount}</p>

  {#each neurons as neuron (neuron.neuronId)}
    {@const controlled = isHotKeyControllable({
      identity: $authStore.identity,
      neuron,
    })}

    <p>
      {neuron.neuronId}
    </p>

    <p>
      {formatICP(neuron.fullNeuron?.cachedNeuronStake ?? BigInt(0))}
    </p>

    <p class="hotkey">
      {#if controlled}
        {$i18n.accounts.attach_hardware_neurons_added}
      {:else}
        <button class="primary small" type="button"
          >{$i18n.accounts.attach_hardware_neurons_add}</button
        >
      {/if}
    </p>
  {/each}
</div>

<style lang="scss">
  @use "../../themes/mixins/media";

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

      min-height: 20px;
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
