<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import Json from "$lib/components/common/Json.svelte";
  import { loadProposalPayload } from "$lib/services/proposals.services";
  import { Spinner } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { proposalPayloadsStore } from "$lib/stores/proposals.store";
  import {keyOfOptional} from "$lib/utils/utils";

  export let proposalId: ProposalId;
  export let nnsFunctionKey: string;

  // Source of indexes and names: https://github.com/dfinity/ic/blob/master/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L349
  let nnsFunctionName: string;
  $: nnsFunctionName =
    keyOfOptional({obj: $i18n.nns_functions, key: nnsFunctionKey}) ??
    $i18n.proposal_detail.unknown_nns_function;

  let payload: object | undefined | null;
  $: $proposalPayloadsStore, (payload = $proposalPayloadsStore.get(proposalId));
  $: if (proposalId !== undefined && !$proposalPayloadsStore.has(proposalId)) {
    loadProposalPayload({
      proposalId,
    });
  }

  // TODO(L2-965): delete legacy component - duplicated by the new component <ProposalPayload />
</script>

<dt>{$i18n.proposal_detail.nns_function_name}</dt>
<dd>{nnsFunctionName}</dd>
{#if payload === undefined}
  <Spinner size="small" inline={true} />
{:else if payload !== null}
  <dt>{$i18n.proposal_detail.payload}</dt>
  <dd><Json json={payload} /></dd>
{/if}
