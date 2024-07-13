<script lang="ts">
  import {
    formatVotingPower,
    formatVotingPowerDetailed,
  } from "$lib/utils/neuron.utils";
  import { Tooltip } from "@dfinity/gix-components";

  export let valueTestId: string;
  export let valueAriaLabel: string | undefined = undefined;
  export let votingPowerE8s: bigint;
</script>

<Tooltip
  testId="voting-power-display-component"
  idPrefix="voting-power-tooltip"
  text={formatVotingPowerDetailed(votingPowerE8s)}
>
  <span data-tid={valueTestId} aria-label={valueAriaLabel}
    >{formatVotingPower(votingPowerE8s)}</span
  >
</Tooltip>
