<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { actionableProposalNotSupportedUniversesStore } from "$lib/derived/actionable-proposals.derived";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils.js";
  import { PageBanner, IconNotificationPage } from "@dfinity/gix-components";

  let snsNames: string;
  $: snsNames = $actionableProposalNotSupportedUniversesStore
    .map((universe) => universe.title)
    .join(", ");
</script>

<TestIdWrapper testId="actionable-proposals-not-supported-snses-component">
  {#if snsNames !== ""}
    <PageBanner testId="actionable-proposals-not-supported-snses-banner">
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
        {$i18n.actionable_proposals_not_supported_snses.text}
      </p>
    </PageBanner>
  {/if}
</TestIdWrapper>
