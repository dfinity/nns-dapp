<script lang="ts">
  import { actionableProposalNotSupportedUniversesStore } from "$lib/derived/actionable-proposals.derived";
  import { i18n } from "$lib/stores/i18n";
  import { joinWithOr, replacePlaceholders } from "$lib/utils/i18n.utils";
  import { IconProposalsPage, PageBanner } from "@dfinity/gix-components";

  let unsupportedUniverseNames: string[] = [];
  $: unsupportedUniverseNames =
    $actionableProposalNotSupportedUniversesStore.map(({ title }) => title);

  let text = "";
  $: text =
    unsupportedUniverseNames.length > 0
      ? replacePlaceholders($i18n.actionable_proposals_empty.text_unsupported, {
          $snsNames: joinWithOr(unsupportedUniverseNames),
        })
      : $i18n.actionable_proposals_empty.text;
</script>

<PageBanner testId="actionable-proposals-empty">
  <IconProposalsPage slot="image" />
  <svelte:fragment slot="title"
    >{$i18n.actionable_proposals_empty.title}</svelte:fragment
  >
  <p class="description" slot="description">{text}</p>
</PageBanner>
