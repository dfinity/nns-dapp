<script lang="ts">
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { i18n } from "../lib/stores/i18n";

  const showThisRoute: boolean = process.env.REDIRECT_TO_LEGACY === "never";
</script>

{#if showThisRoute}
  <HeadlessLayout>
    <svelte:fragment slot="header">{$i18n.neuron_detail.title}</svelte:fragment>
  </HeadlessLayout>
{/if}
