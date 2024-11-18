<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import {
    formatMaturity,
    getStateInfo,
    neuronAvailableMaturity,
    neuronStake,
    neuronStakedMaturity,
  } from "$lib/utils/neuron.utils";
  import { ICPToken, secondsToDuration, TokenAmountV2 } from "@dfinity/utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import { downloadCSV } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    getFutureDateFromDelayInSeconds,
    secondsToDate,
  } from "$lib/utils/date.utils";

  const dispatcher = createEventDispatcher<{
    nnsExportNeuronsCSVTriggered: void;
  }>();

  let isDisabled = true;
  let neurons: NeuronInfo[] = [];

  $: neurons = $neuronsStore?.neurons ?? [];
  $: isDisabled = !neurons.length;

  const exportNeurons = async () => {
    try {
      const humanFriendlyContent = neurons.map(neuronToHumanReadableFormat);

      await downloadCSV({
        entity: humanFriendlyContent,
        fileName: "neurons",
      });
    } catch (error) {
      console.error("Error exporting neurons:", error);
      toastsError({
        labelKey: "export_error.neurons",
      });
    } finally {
      dispatcher("nnsExportNeuronsCSVTriggered");
    }
  };

  const neuronToHumanReadableFormat = (neuron: NeuronInfo) => {
    const neuronId = neuron.neuronId.toString();
    const stake = TokenAmountV2.fromUlps({
      amount: neuronStake(neuron),
      token: ICPToken,
    });
    const availableMaturity = neuronAvailableMaturity(neuron);
    const stakedMaturity = neuronStakedMaturity(neuron);
    const dissolveDelaySeconds = neuron.dissolveDelaySeconds;
    const dissolveDate =
      neuron.state === NeuronState.Dissolving
        ? getFutureDateFromDelayInSeconds(neuron.dissolveDelaySeconds)
        : null;
    const creationDate = secondsToDate(Number(neuron.createdTimestampSeconds));

    // what about maturity in the stake? should I add or show it the same as the Neurons table?
    // state: neuron.state,
    // do I need transalations for this?
    return {
      ["Neuron Id"]: neuronId,
      ["Stake"]: formatTokenV2({
        value: stake,
        detailed: true,
      }),
      ["Available Maturity"]: formatMaturity(availableMaturity),
      ["Staked Maturity"]: formatMaturity(stakedMaturity),
      ["Dissolve Delay"]: secondsToDuration({
        seconds: dissolveDelaySeconds,
        i18n: $i18n.time,
      }),
      ["Dissolve Date"]: dissolveDate ?? "N/A",
      ["Creation Date"]: creationDate,
      ["State"]: $i18n.neuron_state[getStateInfo(neuron.state).textKey],
    };
  };
</script>

<button
  data-tid="export-neurons-button"
  on:click={exportNeurons}
  class="text"
  disabled={isDisabled}
  aria-label={$i18n.header.export_neurons}
>
  <IconDown />
  {$i18n.header.export_neurons}
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
    padding: 0;
  }
</style>
