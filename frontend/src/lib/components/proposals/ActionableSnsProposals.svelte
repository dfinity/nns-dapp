<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import type { RootCanisterIdText } from "$lib/types/sns";
  import type { Universe } from "$lib/types/universe";
  import { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import type { ProposalData } from "@dfinity/sns/dist/candid/sns_governance";
  import { fromNullable, nonNullish } from "@dfinity/utils";
  import type { Readable } from "svelte/store";

  export let universe: Universe;
  export let proposals: ProposalData[];

  let rootCanisterId: RootCanisterIdText;
  $: rootCanisterId = universe.canisterId;

  let nsFunctionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: nsFunctionsStore = createSnsNsFunctionsProjectStore(
    Principal.fromText(rootCanisterId)
  );
  let nsFunctions: SnsNervousSystemFunction[] | undefined;
  $: nsFunctions = nonNullish(nsFunctionsStore) ? $nsFunctionsStore : undefined;
</script>

<TestIdWrapper testId="actionable-sns-proposals-component">
  {#if nonNullish(nsFunctions)}
    <UniverseWithActionableProposals {universe}>
      {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
        <SnsProposalCard
          actionable
          fromActionablePage
          {proposalData}
          {nsFunctions}
          rootCanisterId={universe.canisterId}
        />
      {/each}
    </UniverseWithActionableProposals>
  {/if}
</TestIdWrapper>
