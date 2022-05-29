<script lang="ts">
  import type { Proposal } from "@dfinity/nns";
  import CardBlock from "../../ui/CardBlock.svelte";
  import { i18n } from "../../../../lib/stores/i18n";
  import ProposalSummary from "./ProposalSummary.svelte";

  export let proposal: Proposal | undefined;
</script>

<CardBlock expandable>
  <!-- TODO: add expandable support -- https://dfinity.atlassian.net/browse/L2-270 -->
  <svelte:fragment slot="title">{$i18n.proposal_detail.summary}</svelte:fragment
  >
  <ProposalSummary {proposal} />
</CardBlock>
