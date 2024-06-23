<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";

  const showModal = () =>
    openSnsNeuronModal({ type: "view-active-disbursements" });
</script>

<button class="secondary" on:click={showModal}
  >{$i18n.neuron_detail.view_active_disbursements}</button
>
