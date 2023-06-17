<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { Html } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let testId = "nns-neuron-info-component";
  export let neuron: NeuronInfo;
</script>

<TestIdWrapper {testId}>
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <p data-tid="neuron-id" class="value">{neuron.neuronId}</p>
  </div>

  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="balance">
      <Html
        text={replacePlaceholders($i18n.neurons.amount_icp_stake, {
          $amount: valueSpan(
            formatToken({ value: neuronStake(neuron), detailed: true })
          ),
        })}
      />
    </p>
  </div>
</TestIdWrapper>
