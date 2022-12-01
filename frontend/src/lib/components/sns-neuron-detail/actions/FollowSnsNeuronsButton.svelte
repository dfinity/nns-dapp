<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {openSnsNeuronModal} from "$lib/utils/modals.utils";
</script>

<button
  class="primary"
  on:click={() => openSnsNeuronModal({type: "follow"})}
  data-tid="sns-follow-neurons-button"
  >{$i18n.neuron_detail.follow_neurons}</button
>
