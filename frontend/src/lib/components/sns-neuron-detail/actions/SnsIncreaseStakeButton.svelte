<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
</script>

<button
  class="primary"
  data-tid="sns-increase-stake"
  on:click={() => openSnsNeuronModal({ type: "increase-stake" })}
  >{$i18n.neuron_detail.increase_stake}</button
>
