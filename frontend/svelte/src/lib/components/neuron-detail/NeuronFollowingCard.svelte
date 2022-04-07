<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Card from "../ui/Card.svelte";
  import FollowNeuronsButton from "./actions/FollowNeuronsButton.svelte";

  export let neuron: NeuronInfo;
</script>

<Card>
  <h3 slot="start">{$i18n.neuron_detail.following_title}</h3>
  <p>{$i18n.neuron_detail.following_description}</p>
  <!-- TODO: https://dfinity.atlassian.net/browse/L2-354 -->
  <div class="actions">
    <FollowNeuronsButton {neuron} />
  </div>
</Card>

<style lang="scss">
  h3 {
    margin-bottom: 0;
  }
  p {
    margin-top: 0;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
