<script lang="ts">
  import { AppPath } from "$lib/constants/routes.constants";
  import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { Card } from "@dfinity/gix-components";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import ProjectCardSwapInfo from "./ProjectCardSwapInfo.svelte";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { goto } from "$app/navigation";
  import SignedInOnly from "$lib/components/common/SignedInOnly.svelte";

  export let project: SnsFullProject;

  let summary: SnsSummary;
  let swapCommitment: SnsSwapCommitment | undefined;
  $: ({ summary, swapCommitment } = project);

  let logo: string;
  let name: string;
  let description: string;
  $: ({
    metadata: { logo, name, description },
  } = summary);

  let title: string;
  $: title = `${$i18n.sns_project.project} ${name}`;

  let commitmentE8s: bigint | undefined;
  $: commitmentE8s = getCommitmentE8s(swapCommitment);

  let userHasParticipated: boolean;
  $: userHasParticipated =
    commitmentE8s !== undefined && commitmentE8s > BigInt(0);

  const showProject = async () =>
    await goto(
      `${AppPath.Project}/?project=${project.rootCanisterId.toText()}`
    );
</script>

<Card
  testId="project-card-component"
  role="link"
  on:click={showProject}
  theme={userHasParticipated ? "highlighted" : undefined}
>
  <div class="title" slot="start">
    <Logo src={logo} alt={$i18n.sns_launchpad.project_logo} />
    <h3 data-tid="project-name">{title}</h3>
  </div>

  <p class="value description">{description}</p>

  <ProjectCardSwapInfo {project} />

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
    align-items: flex-start;
    margin-bottom: var(--padding);

    h3 {
      margin: 0;
      line-height: var(--line-height-standard);
      @include text.clamp(2);
    }
  }

  p {
    margin: 0 0 var(--padding-1_5x);
  }

  .spinner {
    margin-top: var(--padding-1_5x);
  }

  .description {
    @include text.clamp(6);
  }
</style>
