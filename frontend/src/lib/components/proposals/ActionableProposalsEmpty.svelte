<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconProposalsPage, PageBanner } from "@dfinity/gix-components";
</script>

<PageBanner testId="actionable-proposals-empty">
  <IconProposalsPage slot="image" />
  <svelte:fragment slot="title"
    >{$i18n.actionable_proposals_empty.title}</svelte:fragment
  >
  <p class="description" slot="description">
    {$i18n.actionable_proposals_empty.text}
  </p>
</PageBanner>
