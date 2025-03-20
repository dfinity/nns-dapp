<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";

  export let isFollowByTopic: boolean = false;

  const openModal = () => {
    openSnsNeuronModal({
      type: isFollowByTopic ? "follow-by-topic" : "follow",
    });
  };
</script>

<button
  class="primary"
  on:click={openModal}
  data-tid="sns-follow-neurons-button"
  >{$i18n.neuron_detail.follow_neurons}</button
>
