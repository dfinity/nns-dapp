<script lang="ts">
  import type { ProposalId } from "@dfinity/nns";
  import Json from "../../common/Json.svelte";
  import { getProposalPayload } from "../../../services/proposals.services";
  import Spinner from "../../ui/Spinner.svelte";

  export let proposalId: ProposalId;

  let payload: object | undefined | null;
  $: proposalId,
    getProposalPayload({
      proposalId,
      onLoad: (response) => {
        payload = response;
      },
      onError: () => (payload = null),
    });
</script>

{#if payload === undefined}
  <Spinner size="small" />
{:else if payload !== null}
  <Json json={payload} />
{/if}
