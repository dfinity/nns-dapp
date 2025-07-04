<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ProposalSystemInfoEntry from "$lib/components/proposal-detail/ProposalSystemInfoEntry.svelte";
  import SnsProposerEntry from "$lib/components/sns-proposals/SnsProposerEntry.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import type { SnsProposalDataMap } from "$lib/utils/sns-proposals.utils";
  import type { SnsNeuronId } from "@dfinity/sns";
  import { fromNullable, nonNullish } from "@dfinity/utils";

  export let proposalDataMap: SnsProposalDataMap;

  let type: string | undefined;
  let topicInfo: TopicInfoWithUnknown | undefined;
  let typeDescription: string | undefined;
  let statusString: string;
  let statusDescription: string | undefined;
  let rewardStatusString: string;
  let rewardStatusDescription: string | undefined;
  let proposal_creation_timestamp_seconds: bigint;
  let decided_timestamp_seconds: bigint;
  let executed_timestamp_seconds: bigint;
  let failed_timestamp_seconds: bigint;
  let proposer: SnsNeuronId | undefined;

  $: ({
    type,
    topicInfo,
    typeDescription,
    statusString,
    statusDescription,
    rewardStatusString,
    rewardStatusDescription,
    proposal_creation_timestamp_seconds,
    decided_timestamp_seconds,
    executed_timestamp_seconds,
    failed_timestamp_seconds,
    proposer,
  } = proposalDataMap);

  let topicName: string | undefined;
  $: topicName = fromNullable(topicInfo?.name ?? []);
  let topicDescription: string | undefined;
  $: topicDescription = fromNullable(topicInfo?.description ?? []);
</script>

<TestIdWrapper testId="proposal-system-info-details-component">
  <h2 class="content-cell-title">
    {$i18n.proposal_detail.headline}
  </h2>

  <div class="content-cell-details">
    {#if nonNullish(type)}
      <ProposalSystemInfoEntry
        label={$i18n.proposal_detail.type_prefix}
        testId="proposal-system-info-type"
        value={type}
        description={typeDescription}
      />
    {/if}

    {#if nonNullish(topicName) && nonNullish(topicDescription)}
      <ProposalSystemInfoEntry
        label={$i18n.proposal_detail.topic_prefix}
        testId="proposal-system-info-topic"
        value={topicName}
        description={topicDescription}
      />
    {/if}

    <ProposalSystemInfoEntry
      label={$i18n.proposal_detail.status_prefix}
      testId="proposal-system-info-status"
      value={statusString}
      description={statusDescription}
    />

    <ProposalSystemInfoEntry
      label={$i18n.proposal_detail.reward_prefix}
      testId="proposal-system-info-reward"
      value={rewardStatusString}
      description={rewardStatusDescription}
    />

    <ProposalSystemInfoEntry
      label={$i18n.proposal_detail.created_prefix}
      testId="proposal-system-info-created"
      value={secondsToDateTime(proposal_creation_timestamp_seconds)}
      description={$i18n.proposal_detail.created_description}
    />

    {#if decided_timestamp_seconds > 0n}
      <ProposalSystemInfoEntry
        label={$i18n.proposal_detail.decided_prefix}
        testId="proposal-system-info-decided"
        value={secondsToDateTime(decided_timestamp_seconds)}
        description={$i18n.proposal_detail.decided_description}
      />
    {/if}

    {#if executed_timestamp_seconds > 0n}
      <ProposalSystemInfoEntry
        label={$i18n.proposal_detail.executed_prefix}
        testId="proposal-system-info-executed"
        value={secondsToDateTime(executed_timestamp_seconds)}
        description={$i18n.proposal_detail.executed_description}
      />
    {/if}

    {#if failed_timestamp_seconds > 0n}
      <ProposalSystemInfoEntry
        label={$i18n.proposal_detail.failed_prefix}
        testId="proposal-system-info-failed"
        value={secondsToDateTime(failed_timestamp_seconds)}
        description={$i18n.proposal_detail.failed_description}
      />
    {/if}

    {#if nonNullish(proposer)}
      <SnsProposerEntry {proposer} />
    {/if}
  </div>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  h2 {
    @include fonts.h3;
  }
</style>
