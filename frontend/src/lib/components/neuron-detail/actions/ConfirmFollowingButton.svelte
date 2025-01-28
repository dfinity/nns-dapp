<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { refreshVotingPowerForNeurons } from "$lib/services/neurons.services";
  import { createEventDispatcher } from "svelte";

  export let neuronIds: bigint[];

  const dispatcher = createEventDispatcher<{
    nnsComplete: { successCount: number; totalCount: number };
  }>();

  const onClick = async () => {
    startBusy({
      initiator: "refresh-voting-power",
      labelKey: "missing_rewards.confirming",
    });

    const totalCount = neuronIds.length;
    const { successCount } = await refreshVotingPowerForNeurons({ neuronIds });

    stopBusy("refresh-voting-power");
    dispatcher("nnsComplete", { successCount, totalCount });
  };
</script>

<button
  on:click={onClick}
  class="secondary"
  data-tid="confirm-following-button-component"
  >{$i18n.missing_rewards.confirm}</button
>
