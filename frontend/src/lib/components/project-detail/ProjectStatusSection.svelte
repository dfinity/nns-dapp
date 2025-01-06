<script lang="ts">
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSwapCommitment } from "$lib/types/sns";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { ICPToken, TokenAmount, isNullish, nonNullish } from "@dfinity/utils";
  import { getContext } from "svelte";
  import ParticipateButton from "./ParticipateButton.svelte";
  import ProjectCommitment from "./ProjectCommitment.svelte";
  import ProjectStatus from "./ProjectStatus.svelte";
  import ProjectTimelineUserCommitment from "./ProjectTimelineUserCommitment.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swapCommitment: SnsSwapCommitment | undefined | null;
  $: swapCommitment = $projectDetailStore.swapCommitment;

  let myCommitment: bigint | undefined;
  $: myCommitment = getCommitmentE8s(swapCommitment);

  let myCommitmentIcp: TokenAmount | undefined;
  $: myCommitmentIcp =
    myCommitment !== undefined
      ? TokenAmount.fromE8s({ amount: myCommitment, token: ICPToken })
      : undefined;

  let loadingSummary: boolean;
  $: loadingSummary = isNullish($projectDetailStore.summary);

  let lifecycle: number;
  $: lifecycle =
    $projectDetailStore.summary?.getLifecycle() ?? SnsSwapLifecycle.Unspecified;

  let displayStatusSection = false;
  $: displayStatusSection =
    !loadingSummary &&
    [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Adopted,
    ].includes(lifecycle);
</script>

<!-- Because information might not be displayed once loaded - according the state - we do no display a spinner or skeleton -->

{#if displayStatusSection && nonNullish($projectDetailStore.summary)}
  <div data-tid="sns-project-detail-status" class="content-cell-island">
    <ProjectStatus />

    <div class="content content-cell-details">
      <ProjectCommitment />

      <ProjectTimelineUserCommitment
        summary={$projectDetailStore.summary}
        swapCommitment={$projectDetailStore.swapCommitment}
        myCommitment={myCommitmentIcp}
      />
    </div>

    <div class="actions content-cell-details">
      <ParticipateButton />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(medium) {
      align-items: flex-start;
    }
  }
</style>
