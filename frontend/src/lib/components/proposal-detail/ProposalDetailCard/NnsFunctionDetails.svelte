<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import Json from "../../common/Json.svelte";
  import { loadProposalPayload } from "../../../services/proposals.services";
  import Spinner from "../../ui/Spinner.svelte";
  import { i18n } from "../../../stores/i18n";
  import { proposalPayloadsStore } from "../../../stores/proposals.store";
  import { NnsFunction } from "@dfinity/nns";

  export let proposalId: ProposalId;
  export let nnsFunction: NnsFunction;

  // Source of indexes and names: https://github.com/dfinity/ic/blob/master/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L349
  let nnsFunctionName: string;
  $: nnsFunctionName =
    $i18n.nns_functions[nnsFunction] ??
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
