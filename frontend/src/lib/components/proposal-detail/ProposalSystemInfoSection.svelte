<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import ProposalSystemInfoEntry from "./ProposalSystemInfoEntry.svelte";

  export let proposalInfo: ProposalInfo;

  let type: string | undefined;
  let typeDescription: string | undefined;
  let topic: string | undefined;
  let topicDescription: string | undefined;
  let statusString: string;
  let statusDescription: string | undefined;

  $: ({
    type,
    topic,
    statusString,
    typeDescription,
    topicDescription,
    statusDescription,
  } = mapProposalInfo(proposalInfo));
</script>

<h1>{type ?? ""}</h1>

<div class="details" data-tid="proposal-system-info-details">
  <ProposalSystemInfoEntry
    labelKey="type_prefix"
    testId="proposal-system-info-type"
    value={type}
    description={typeDescription}
  />

  <ProposalSystemInfoEntry
    labelKey="topic_prefix"
    testId="proposal-system-info-topic"
    value={topic}
    description={topicDescription}
  />

  <ProposalSystemInfoEntry
    labelKey="status_prefix"
    testId="proposal-system-info-status"
    value={statusString}
    description={statusDescription}
  />
</div>

<style lang="scss">
  h1 {
    margin: 0;
    line-height: var(--line-height-standard);
  }

  .details {
    margin-top: var(--padding-2x);

    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
