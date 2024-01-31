<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import type { SnsProposalDataMap } from "$lib/utils/sns-proposals.utils";
  import type { SnsNeuronId } from "@dfinity/sns";
  import { nonNullish } from "@dfinity/utils";
  import ProposalSystemInfoEntry from "../proposal-detail/ProposalSystemInfoEntry.svelte";
  import SnsProposerEntry from "./SnsProposerEntry.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let proposalDataMap: SnsProposalDataMap;

  let type: string | undefined;
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
</script>

<TestIdWrapper testId="proposal-system-info-details-component">
  <h1 class="content-cell-title">
    {$i18n.proposal_detail.headline}
  </h1>

  <div class="content-cell-details">
    {#if nonNullish(type)}
      <ProposalSystemInfoEntry
        labelKey="type_prefix"
        testId="proposal-system-info-type"
        value={type}
        description={typeDescription}
      />
    {/if}

    <ProposalSystemInfoEntry
      labelKey="status_prefix"
      testId="proposal-system-info-status"
      value={statusString}
      description={statusDescription}
    />

    <ProposalSystemInfoEntry
      labelKey="reward_prefix"
      testId="proposal-system-info-reward"
      value={rewardStatusString}
      description={rewardStatusDescription}
    />

    <ProposalSystemInfoEntry
      labelKey="created_prefix"
      testId="proposal-system-info-created"
      value={secondsToDateTime(proposal_creation_timestamp_seconds)}
      description={$i18n.proposal_detail.created_description}
    />

    {#if decided_timestamp_seconds > 0n}
      <ProposalSystemInfoEntry
        labelKey="decided_prefix"
        testId="proposal-system-info-decided"
        value={secondsToDateTime(decided_timestamp_seconds)}
        description={$i18n.proposal_detail.decided_description}
      />
    {/if}

    {#if executed_timestamp_seconds > 0n}
      <ProposalSystemInfoEntry
        labelKey="executed_prefix"
        testId="proposal-system-info-executed"
        value={secondsToDateTime(executed_timestamp_seconds)}
        description={$i18n.proposal_detail.executed_description}
      />
    {/if}

    {#if failed_timestamp_seconds > 0n}
      <ProposalSystemInfoEntry
        labelKey="failed_prefix"
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

  h1 {
    @include fonts.h3;
  }
</style>
