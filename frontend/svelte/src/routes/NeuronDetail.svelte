<script>
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { i18n } from "../lib/stores/i18n";
</script>

{#if process.env.REDIRECT_TO_LEGACY === "never"}
  <HeadlessLayout>
    <svelte:fragment slot="header">{$i18n.neuron_detail.title}</svelte:fragment>
  </HeadlessLayout>
{/if}
