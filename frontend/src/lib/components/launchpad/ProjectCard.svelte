<script lang="ts">
  import SignedInOnly from "$lib/components/common/SignedInOnly.svelte";
  import ProjectCardSwapInfo from "$lib/components/launchpad/ProjectCardSwapInfo.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { loadSnsFinalizationStatus } from "$lib/services/sns-finalization.services";
  import { i18n } from "$lib/stores/i18n";
  import { createIsSnsFinalizingStore } from "$lib/stores/sns-finalization-status.store";
  import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { Card, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";
  import type { Readable } from "svelte/store";

  export let project: SnsFullProject;

  onMount(() => {
    loadSnsFinalizationStatus({ rootCanisterId: project.rootCanisterId });
  });

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  let rootCanisterId: Principal;
  $: ({ summary, swapCommitment, rootCanisterId } = project);

  let logo: string;
  let name: string;
  let description: string;
  $: ({
    metadata: { logo, name, description },
  } = summary);

  let commitmentE8s: bigint | undefined;
  $: commitmentE8s = getCommitmentE8s(swapCommitment);

  let userHasParticipated: boolean;
  $: userHasParticipated = nonNullish(commitmentE8s) && commitmentE8s > 0n;

  let href: string;
  $: href = `${AppPath.Project}/?project=${project.rootCanisterId.toText()}`;

  let isFinalizingStore: Readable<boolean>;
  $: isFinalizingStore = createIsSnsFinalizingStore(rootCanisterId);
</script>

<Card
  testId="project-card-component"
  {href}
  theme={userHasParticipated ? "highlighted" : undefined}
>
  <div class="title" slot="start">
    <Logo src={logo} alt={$i18n.sns_launchpad.project_logo} size="big" />
    <h3 data-tid="project-name">{name}</h3>
  </div>

  <p data-tid="project-description" class="value description">{description}</p>

  <ProjectCardSwapInfo isFinalizing={$isFinalizingStore} {project} />

  <SignedInOnly>
    <!-- TODO L2-751: handle fetching errors -->
    {#if swapCommitment === undefined}
      <div class="spinner">
        <Spinner size="small" inline />
      </div>
    {/if}
  </SignedInOnly>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
    margin-bottom: var(--padding);

    h3 {
      margin: 0;
      line-height: var(--line-height-standard);
      @include text.clamp(2);
    }
  }

  p {
    margin: 0 0 var(--padding-1_5x);
    // Occupy all available space to shift blocks after the description down
    flex-grow: 1;
  }

  .spinner {
    margin-top: var(--padding-1_5x);
  }

  .description {
    @include text.clamp(6);
  }
</style>
