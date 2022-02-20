<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";

  export let proposalInfo: ProposalInfo;
</script>

<!-- TODO: https://dfinity.atlassian.net/browse/L2-284 -->
<!-- if (ineligibleNeurons.isNotEmpty && latestProposal.status == ProposalStatus.Open) IneligibleNeuronsWidget(ineligibleNeurons: ineligibleNeurons) -->
<Card>
  <h3>Ineligible Neurons</h3>
  <p>
    The following neurons had a dissolve delay of less than 6 months at the time
    the proposal was submitted, or were created after the proposal was
    submitted, and therefore are not eligible to vote on it:
  </p>
  <!-- ...ineligibleNeurons.map((p) => TableRow(children: [... -->
</Card>

<style lang="scss">
</style>
