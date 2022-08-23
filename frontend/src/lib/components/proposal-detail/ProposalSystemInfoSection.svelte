<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import { i18n } from "../../stores/i18n";
  import { sanitizeHTML } from "../../utils/html.utils";

  export let proposalInfo: ProposalInfo;

  let type: string | undefined;
  let type_description: string | undefined;
  let topic: string | undefined;
  let topic_description: string | undefined;
  $: ({ type, topic, type_description, topic_description } =
    mapProposalInfo(proposalInfo));

  let sanitizedTypeDescription = "";
  $: type_description,
    (async () =>
      (sanitizedTypeDescription = await sanitizeHTML(
        type_description ?? ""
      )))();
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
      {topic_description}
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
