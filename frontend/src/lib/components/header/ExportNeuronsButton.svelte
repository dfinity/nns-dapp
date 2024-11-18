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
  import { downloadCSV } from "$lib/utils/export-to-csv";

  // to src/lib/types/neurons-table.ts ??
  type ExportNeuron = {
    neuronId: string;
    stake: TokenAmountV2;
    availableMaturity: bigint;
    stakedMaturity: bigint;
    dissolveDelaySeconds: bigint;
    dissolveDate: Date | null;
    state: NeuronState;
  };

  // Component code
  const dispatcher = createEventDispatcher<{
    nnsExportNeuronsCSVTriggered: void;
  }>();

  let isDisabled = true;
  let neurons: NeuronInfo[] = [];

  $: neurons = $neuronsStore?.neurons ?? [];
  $: isDisabled = !neurons.length;

  const exportNeurons = async () => {
    try {
      const neuronsforExport = buildExportNeurons(neurons);
      const renderableNeurons = renderExportNeurons(neuronsforExport);

      await downloadCSV({
        entity: renderableNeurons,
        fileName: "neurons",
      });
    } catch (error) {
      // Handle error appropriately, what can go wrong?
      console.error("Error exporting neurons:", error);
    } finally {
      dispatcher("nnsExportNeuronsCSVTriggered");
    }
  };
  // End of component code

  // to ic-js/date/utils or not needed?
  const getDateFromSeconds = (seconds: number | bigint): Date => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Number(seconds) * 1000);
    return futureDate;
  };

  // should I move this somewhere else?
  const buildExportNeurons = (neurons: NeuronInfo[]) => {
    return neurons.map((neuron) => ({
      neuronId: neuron.neuronId.toString(),
      stake: TokenAmountV2.fromUlps({
        amount: neuronStake(neuron),
        token: ICPToken,
      }),
      availableMaturity: neuronAvailableMaturity(neuron),
      stakedMaturity: neuronStakedMaturity(neuron),
      dissolveDelaySeconds: neuron.dissolveDelaySeconds,
      dissolveDate:
        neuron.state === NeuronState.Dissolving
          ? getDateFromSeconds(neuron.dissolveDelaySeconds)
          : null,
      state: neuron.state,
    }));
  };

  const renderExportNeurons = (neurons: ExportNeuron[]) => {
    return neurons.map((neuron) => {
      return {
        id: neuron.neuronId,
        stake: formatTokenV2({
          value: neuron.stake,
          detailed: true,
        }),
        availableMaturity: formatMaturity(neuron.availableMaturity),
        stakedMaturity: formatMaturity(neuron.stakedMaturity),
        dissolveDelay: secondsToDuration({
          seconds: neuron.dissolveDelaySeconds,
          i18n: $i18n.time,
        }),
        dissolveDate: neuron.dissolveDate?.toLocaleString() ?? "N/A",
        state: $i18n.neuron_state[getStateInfo(neuron.state).textKey],
      };
    });
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
