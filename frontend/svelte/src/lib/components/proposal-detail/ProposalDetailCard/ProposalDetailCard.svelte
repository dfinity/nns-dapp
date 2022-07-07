<script lang="ts">
  import { type ProposalId, ProposalStatus } from "@dfinity/nns";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import CardInfo from "../../ui/CardInfo.svelte";
  import { i18n } from "../../../../lib/stores/i18n";
  import ProposalMeta from "../../proposals/ProposalMeta.svelte";
  import ProposalActions from "./ProposalActions.svelte";
  import ProposalSummaryCardBlock from "./ProposalSummaryCardBlock.svelte";
  import { mapProposalInfo } from "../../../utils/proposals.utils";
  import type { Color } from "../../../types/theme";
  import Tag from "../../ui/Tag.svelte";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let status: ProposalStatus = ProposalStatus.PROPOSAL_STATUS_UNKNOWN;
  let color: Color | undefined;

  $: ({ id, proposal, status, title, color } = mapProposalInfo(proposalInfo));
</script>

<CardInfo>
  <h2 class="title" slot="start" {title}>{title}</h2>
  <Tag tagName="h3" slot="end" {color}>
    {$i18n.status[ProposalStatus[status]]}
  </Tag>
  <ProposalSummaryCardBlock {proposal} />

  <div class="detail">
    <ProposalMeta {proposalInfo} />
  </div>

  <ProposalActions proposalId={id} {proposal} />
</CardInfo>

<style lang="scss">
  @use "../../../themes/mixins/media";
  @use "../../../themes/mixins/text";

  .title {
    line-height: var(--line-height-standard);
    overflow-wrap: anywhere;
    @include text.clamp(3);

    @include media.min-width(medium) {
      margin-top: var(--padding-0_5x);
      padding-right: var(--padding);
    }
  }

  .detail {
    margin: var(--padding-3x) 0;
  }

  h2 {
    margin: 0;
    line-height: var(--line-height-standard);
  }
</style>
