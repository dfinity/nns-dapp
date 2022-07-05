<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import type { ProposalId } from "@dfinity/nns";
  import VotesProgress from "./VotesProgress.svelte";

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

<Card role="link" withArrow on:click={showProposal} testId="sns-proposal-card">
  <h3 slot="start">{title}</h3>
  <VotesProgress {proposalInfo} />
</Card>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }
</style>
