<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {openSnsNeuronModal} from "$lib/utils/modals.utils";
</script>

<button
  class="primary"
  data-tid="sns-increase-dissolve-delay"
  on:click={() => openSnsNeuronModal({type: "increase-dissolve-delay"})}
  >{$i18n.neuron_detail.increase_dissolve_delay}</button
>
