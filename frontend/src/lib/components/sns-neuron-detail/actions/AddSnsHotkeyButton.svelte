<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {openSnsNeuronModal} from "$lib/utils/modals.utils";
</script>

<button
  data-tid="add-hotkey-button"
  class="primary"
  on:click={() => openSnsNeuronModal({type: "add-hotkey"})}
  >{$i18n.neuron_detail.add_hotkey}</button
>
