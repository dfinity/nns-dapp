<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import VotesCard from "./VotesCard.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "./IneligibleNeuronsCard.svelte";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;

  $: ({ title, proposal } = mapProposalInfo(proposalInfo));
</script>

<VotesCard {proposalInfo} />
<VotingCard {proposalInfo} />
<IneligibleNeuronsCard {proposalInfo} neurons={$definedNeuronsStore} />
