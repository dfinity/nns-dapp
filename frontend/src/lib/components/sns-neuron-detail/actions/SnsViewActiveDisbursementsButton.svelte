<script lang="ts">
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { i18n } from "$lib/stores/i18n";

  const showModal = () =>
    openSnsNeuronModal({ type: "view-active-disbursements" });
</script>

<button class="secondary" on:click={showModal}
  >{$i18n.neuron_detail.view_active_disbursements}</button
>
