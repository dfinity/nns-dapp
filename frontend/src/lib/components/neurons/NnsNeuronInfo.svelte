<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { Html } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
</script>

<div>
  <p class="label">{$i18n.neurons.neuron_id}</p>
  <p class="value">{neuron.neuronId}</p>
</div>

<div>
  <p class="label">{$i18n.neurons.neuron_balance}</p>
  <p>
    <Html
      text={replacePlaceholders($i18n.neurons.amount_icp_stake, {
        $amount: valueSpan(
          formatToken({ value: neuronStake(neuron), detailed: true })
        ),
      })}
    />
  </p>
</div>
