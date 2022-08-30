<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import VotesCard from "./VotesCard.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "./IneligibleNeuronsCard.svelte";

  export let proposalInfo: ProposalInfo;
</script>

<VotesCard {proposalInfo} />
<VotingCard {proposalInfo} />
<IneligibleNeuronsCard {proposalInfo} neurons={$definedNeuronsStore} />
