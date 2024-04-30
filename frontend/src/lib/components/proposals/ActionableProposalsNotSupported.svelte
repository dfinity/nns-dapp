<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { PageBanner, IconNotificationPage } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils.js";

  export let snsName: string;
</script>

<PageBanner testId="actionable-proposals-not-supported">
  <IconNotificationPage slot="image" />
  <svelte:fragment slot="title"
    >{replacePlaceholders($i18n.actionable_proposals_not_supported.title, {
      $snsName: snsName,
    })}</svelte:fragment
  >
  <p class="description" slot="description">
    {replacePlaceholders($i18n.actionable_proposals_not_supported.text, {
      $snsName: snsName,
    })}
  </p>
</PageBanner>
