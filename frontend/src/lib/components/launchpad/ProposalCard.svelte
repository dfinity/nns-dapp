<script lang="ts">
  import { Card } from "@dfinity/gix-components";
  import type { ProposalInfo } from "@dfinity/nns";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import type { ProposalId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import ProposalMeta from "../proposals/ProposalMeta.svelte";

  export let proposalInfo: ProposalInfo;

  let id: ProposalId | undefined;
  let title: string | undefined;

  $: ({ id, title } = mapProposalInfo(proposalInfo));

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${id}`,
    });
  };
</script>

<Card testId="sns-proposal-card">
  <h3 slot="start">{title}</h3>

  <ProposalMeta {proposalInfo} />

  <button data-tid="vote-for-sns" class="primary small" on:click={showProposal}
    >{$i18n.proposal_detail.vote}</button
  >
</Card>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  button {
    float: right;
    margin-top: var(--padding);
  }
</style>
