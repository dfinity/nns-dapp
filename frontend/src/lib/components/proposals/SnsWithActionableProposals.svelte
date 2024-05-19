<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
  import type { ProposalData } from "@dfinity/sns/dist/candid/sns_governance";
  import type { RootCanisterIdText } from "$lib/types/sns";
  import { fromNullable, nonNullish } from "@dfinity/utils";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { Principal } from "@dfinity/principal";
  import type { Universe } from "$lib/types/universe";
  import type { Readable } from "svelte/store";

  export let universe: Universe;

  let rootCanisterId: RootCanisterIdText;
  $: rootCanisterId = universe.canisterId;

  let proposals: ProposalData[] | undefined;
  $: proposals = $actionableSnsProposalsStore[rootCanisterId]?.proposals;

  let nsFunctionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: nsFunctionsStore = createSnsNsFunctionsProjectStore(
    Principal.fromText(rootCanisterId)
  );
  let nsFunctions: SnsNervousSystemFunction[] | undefined;
  $: nsFunctions = nonNullish(nsFunctionsStore) ? $nsFunctionsStore : undefined;
</script>

<TestIdWrapper testId="sns-with-actionable-proposals-component">
  {#if proposals && proposals.length > 0 && nonNullish(nsFunctions)}
    <UniverseWithActionableProposals {universe}>
      {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
        <SnsProposalCard
          actionable
          fromActionablePage
          {proposalData}
          {nsFunctions}
          {universe}
        />
      {/each}
    </UniverseWithActionableProposals>
  {/if}
</TestIdWrapper>
