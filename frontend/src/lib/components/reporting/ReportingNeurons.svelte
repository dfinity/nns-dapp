<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ReportingNeuronsButton from "./ReportingNeuronsButton.svelte";
</script>

<div class="wrapper">
  <div>
    <h3>{$i18n.reporting.neurons_title}</h3>
    <p class="description">{$i18n.reporting.neurons_description}</p>
  </div>
  <ReportingNeuronsButton />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-3x);
  }
</style>
