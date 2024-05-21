<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { PageBanner, IconNotificationPage } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils.js";
  import { actionableProposalNotSupportedUniversesStore } from "$lib/derived/actionable-proposals.derived";

  let snsNames: string;
  $: snsNames =
    $actionableProposalNotSupportedUniversesStore
      .map((universe) => universe.title)
      .join(", ") ?? "";
</script>

<PageBanner testId="actionable-proposals-not-supported">
  <IconNotificationPage slot="image" />
  <svelte:fragment slot="title"
    >{replacePlaceholders(
      $i18n.actionable_proposals_not_supported_snses.title,
      {
        $snsNames: snsNames,
      }
    )}</svelte:fragment
  >
  <p class="description" slot="description">
    {replacePlaceholders($i18n.actionable_proposals_not_supported_snses.text, {
      $snsName: snsNames,
    })}
  </p>
</PageBanner>
