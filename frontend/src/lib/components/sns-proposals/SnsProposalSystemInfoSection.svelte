<script lang="ts">
  import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
  import { i18n } from "$lib/stores/i18n";
  import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
  import type { Principal } from "@dfinity/principal";
  import type {
    SnsNervousSystemFunction,
    SnsNeuronId,
    SnsProposalData,
  } from "@dfinity/sns";
  import { nonNullish } from "@dfinity/utils";
  import ProposalSystemInfoEntry from "../proposal-detail/ProposalSystemInfoEntry.svelte";
  import SnsProposerEntry from "./SnsProposerEntry.svelte";

  export let proposal: SnsProposalData;
  export let rootCanisterId: Principal;

  $: loadSnsNervousSystemFunctions(rootCanisterId);

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

  let nsFunctions: SnsNervousSystemFunction[];
  $: nsFunctions =
    $snsFunctionsStore[rootCanisterId.toText()]?.nsFunctions || [];

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
  } = mapProposalInfo({ proposalData: proposal, nsFunctions }));
</script>

<div
  class="content-cell-island"
  data-tid="proposal-system-info-details-component"
>
  <h1 class="content-cell-title">{type ?? ""}</h1>

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

    {#if decided_timestamp_seconds > BigInt(0)}
      <ProposalSystemInfoEntry
        labelKey="decided_prefix"
        testId="proposal-system-info-decided"
        value={secondsToDateTime(decided_timestamp_seconds)}
        description={$i18n.proposal_detail.decided_description}
      />
    {/if}

    {#if executed_timestamp_seconds > BigInt(0)}
      <ProposalSystemInfoEntry
        labelKey="executed_prefix"
        testId="proposal-system-info-executed"
        value={secondsToDateTime(executed_timestamp_seconds)}
        description={$i18n.proposal_detail.executed_description}
      />
    {/if}

    {#if failed_timestamp_seconds > BigInt(0)}
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
</div>
