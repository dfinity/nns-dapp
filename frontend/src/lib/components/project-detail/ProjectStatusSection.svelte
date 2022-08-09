<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import type { SnsSwapCommitment, SnsSummary } from "../../types/sns";
  import Icp from "../ic/ICP.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProjectStatus from "./ProjectStatus.svelte";
  import ProjectCommitment from "./ProjectCommitment.svelte";
  import ProjectUserCommitmentLabel from "./ProjectUserCommitmentLabel.svelte";
  import ProjectTimeline from "./ProjectTimeline.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import { isNullish } from "../../utils/utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import ParticipateButton from "./ParticipateButton.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swapCommitment: SnsSwapCommitment | undefined | null;
  $: swapCommitment = $projectDetailStore.swapCommitment;

  let myCommitment: bigint | undefined;
  $: myCommitment = swapCommitment?.myCommitment?.amount_icp_e8s;

  let myCommitmentIcp: ICP | undefined;
  $: myCommitmentIcp =
    myCommitment !== undefined ? ICP.fromE8s(myCommitment) : undefined;

  let loadingSummary: boolean;
  $: loadingSummary = isNullish($projectDetailStore.summary);
  let loadingSwapState: boolean;
  $: loadingSwapState = isNullish($projectDetailStore.swapCommitment);

  let lifecycle: number;
  $: ({
    swap: {
      state: { lifecycle },
    },
  } =
    $projectDetailStore.summary ??
    ({
      swap: { state: { lifecycle: SnsSwapLifecycle.Unspecified } },
    } as unknown as SnsSummary));

  let displayStatusSection: boolean = false;
  $: displayStatusSection =
    !loadingSummary &&
    !loadingSwapState &&
    [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed].includes(lifecycle);
</script>

<!-- Because information might not be displayed once loaded - according the state - we do no display a spinner or skeleton -->

{#if displayStatusSection}
  <div class="wrapper" data-tid="sns-project-detail-status">
    <ProjectStatus />

    <div class="content">
      <ProjectCommitment />

      <ProjectTimeline />
    </div>
    <div class="actions">
      {#if myCommitmentIcp !== undefined}
        <div>
          <KeyValuePair>
            <ProjectUserCommitmentLabel
              slot="key"
              summary={$projectDetailStore.summary}
              {swapCommitment}
            />
            <svelte:fragment slot="value">
              <Icp icp={myCommitmentIcp} singleLine />
            </svelte:fragment>
          </KeyValuePair>
        </div>
      {/if}

      <ParticipateButton />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    padding-top: var(--padding-2x);

    @include media.min-width(medium) {
      padding: 0;
      align-items: flex-start;
    }
  }
</style>
