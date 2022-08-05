<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { secondsToDate } from "../../utils/date.utils";
  import Value from "../ui/Value.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronCard from "../sns-neurons/SnsNeuronCard.svelte";

  export let neuron: SnsNeuron;
</script>

<SnsNeuronCard {neuron} cardType="info">
  <section>
    <p>
      <Value>{secondsToDate(Number(neuron.created_timestamp_seconds))}</Value>
      - {$i18n.neurons.staked}
    </p>
  </section>
</SnsNeuronCard>

<style lang="scss">
  @use "../../themes/mixins/media";
  section {
    padding: var(--padding) 0 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
