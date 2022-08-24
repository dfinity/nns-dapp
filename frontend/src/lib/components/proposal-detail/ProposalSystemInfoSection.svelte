<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import { i18n } from "../../stores/i18n";
  import { sanitizeHTML } from "../../utils/html.utils";

  export let proposalInfo: ProposalInfo;

  let type: string | undefined;
  let typeDescription: string | undefined;
  let topic: string | undefined;
  let topicDescription: string | undefined;
  $: ({ type, topic, typeDescription, topicDescription } =
    mapProposalInfo(proposalInfo));

  // We sanitize the type description because unlike the topic, it can contain HTML tags
  let sanitizedTypeDescription = "";
  $: typeDescription,
    (async () =>
      (sanitizedTypeDescription = await sanitizeHTML(typeDescription ?? "")))();
</script>

<h1>{type ?? ""}</h1>

<div class="details" data-tid="proposal-system-info-details">
  <KeyValuePairInfo>
    <svelte:fragment slot="key"
      >{$i18n.proposal_detail.type_prefix}</svelte:fragment
    >
    <span class="value" slot="value" data-tid="proposal-system-info-type"
      >{type}</span
    >
    <p slot="info" data-tid="proposal-system-info-type-description">
      {@html sanitizedTypeDescription}
    </p>
  </KeyValuePairInfo>

  <KeyValuePairInfo>
    <svelte:fragment slot="key"
      >{$i18n.proposal_detail.topic_prefix}</svelte:fragment
    >
    <span class="value" slot="value" data-tid="proposal-system-info-topic"
      >{topic}</span
    >
    <p slot="info" data-tid="proposal-system-info-topic-description">
      {topicDescription}
    </p>
  </KeyValuePairInfo>
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
