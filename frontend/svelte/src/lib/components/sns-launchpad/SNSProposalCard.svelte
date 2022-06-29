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

  $: ({ status, id, title, color } = mapProposalInfo(proposalInfo));

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${id}`,
    });
  };
</script>

<Card role="link" on:click={showProposal} testId="proposal-card">
  <h2 slot="start">{title}</h2>

  <VotesProgress {proposalInfo} />
</Card>

<style lang="scss">
  @use "../../themes/mixins/card";
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/text";

  li.hidden {
    visibility: hidden;
  }

  h2 {
    // TODO L2-751: to remove
    @include text.clamp(1);

    width: 100%;
    line-height: var(--line-height-standard);
  }

  .title {
    @include media.min-width(small) {
      margin: 0 var(--padding-2x) 0 0;
    }
  }
</style>
