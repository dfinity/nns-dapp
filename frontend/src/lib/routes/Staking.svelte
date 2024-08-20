<script lang="ts">
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { Universe } from "$lib/types/universe";
  import { IconNeuronsPage, PageBanner } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";

  const getShowStakingBanner = ({
    isSignedIn,
    universes,
    nnsNeurons,
    snsNeurons,
  }: {
    isSignedIn: boolean;
    universes: Universe[];
    nnsNeurons: NeuronInfo[] | undefined;
    snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
  }) => {
    if (!isSignedIn) {
      return true;
    }
    // If the user is signed in, we show the staking banner if we know the user
    // has 0 neurons.
    if (nnsNeurons?.length !== 0) {
      return false;
    }
    for (const universe of universes) {
      if (universe.canisterId === OWN_CANISTER_ID_TEXT) {
        continue;
      }
      if (snsNeurons[universe.canisterId]?.neurons?.length !== 0) {
        return false;
      }
    }
    return true;
  };

  let showStakingBanner: boolean;
  $: showStakingBanner = getShowStakingBanner({
    isSignedIn: $authSignedInStore,
    universes: $selectableUniversesStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
  });
</script>

<IslandWidthMain testId="staking-component">
  <div class="content">
    {#if showStakingBanner}
      <PageBanner testId="staking-page-banner">
        <IconNeuronsPage slot="image" />
        <svelte:fragment slot="title">{$i18n.staking.title}</svelte:fragment>
        <p class="description" slot="description">{$i18n.staking.text}</p>
        <SignInGuard slot="actions" />
      </PageBanner>
    {/if}

    <ProjectsTable />
  </div>
</IslandWidthMain>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
