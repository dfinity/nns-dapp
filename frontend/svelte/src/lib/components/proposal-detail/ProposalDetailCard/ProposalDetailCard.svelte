<script lang="ts">
  import {type ProposalId, ProposalStatus} from "@dfinity/nns";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import Badge from "../../ui/Badge.svelte";
  import Card from "../../ui/Card.svelte";
  import type { ProposalColor } from "../../../../lib/constants/proposals.constants";
  import { i18n } from "../../../../lib/stores/i18n";
  import ProposalMeta from "../../proposals/ProposalMeta.svelte";
  import ProposalActions from "./ProposalActions.svelte";
  import ProposalSummaryCardBlock from "./ProposalSummaryCardBlock.svelte";
  import { mapProposalInfo } from "../../../utils/proposals.utils";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let status: ProposalStatus = ProposalStatus.PROPOSAL_STATUS_UNKNOWN;
  let color: ProposalColor;

  $: ({ id, proposal, status, title, color } = mapProposalInfo(proposalInfo));
</script>

<Card>
  <h2 class="title" slot="start" {title}>{title}</h2>
  <Badge slot="end" {color}
    ><h2 class="status">{$i18n.status[ProposalStatus[status]]}</h2></Badge
  >
  <ProposalSummaryCardBlock {proposal} />

  <div class="detail">
    <ProposalMeta {proposalInfo} />
  </div>

  <ProposalActions proposalId={id} {proposal} />
</Card>

<style lang="scss">
  @use "../../../themes/mixins/media";
  @use "../../../themes/mixins/text";

  .title {
    font-size: var(--font-size-h5);
    line-height: var(--line-height-standard);
    overflow-wrap: anywhere;
    @include text.clamp(3);

    @include media.min-width(medium) {
      margin-top: var(--padding-0_5x);
      padding-right: var(--padding);
      font-size: var(--font-size-h3);
    }
  }

  .status {
    min-width: fit-content;
    font-size: var(--font-size-h3);
    color: inherit;
  }

  .detail {
    margin: var(--padding-3x) 0;
  }
</style>
