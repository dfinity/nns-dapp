<script lang="ts">
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import type { SnsSwapCommitment, SnsSummary } from "$lib/types/sns";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { BottomSheet, KeyValuePair } from "@dfinity/gix-components";
  import ProjectStatus from "./ProjectStatus.svelte";
  import ProjectCommitment from "./ProjectCommitment.svelte";
  import ProjectUserCommitmentLabel from "./ProjectUserCommitmentLabel.svelte";
  import ProjectTimeline from "./ProjectTimeline.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import { isNullish } from "$lib/utils/utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import ParticipateButton from "./ParticipateButton.svelte";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";

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
  $: ({
    swap: { lifecycle },
  } =
    $projectDetailStore.summary ??
    ({
      swap: { state: { lifecycle: SnsSwapLifecycle.Unspecified } },
    } as unknown as SnsSummary));

  let displayStatusSection = false;
  $: displayStatusSection =
    !loadingSummary &&
    [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed].includes(lifecycle);
</script>

<!-- Because information might not be displayed once loaded - according the state - we do no display a spinner or skeleton -->

{#if displayStatusSection}
  <div data-tid="sns-project-detail-status">
    <ProjectStatus />

    <div class="content content-cell-details">
      <ProjectCommitment />

      <ProjectTimeline />
    </div>

    <div class="actions content-cell-details">
      {#if myCommitmentIcp !== undefined}
        <div>
          <KeyValuePair>
            <ProjectUserCommitmentLabel
              slot="key"
              summary={$projectDetailStore.summary}
              {swapCommitment}
            />
            <AmountDisplay slot="value" amount={myCommitmentIcp} singleLine />
          </KeyValuePair>
        </div>
      {/if}

      <BottomSheet>
        <div role="toolbar">
          <ParticipateButton />
        </div>
      </BottomSheet>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

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
  [role="toolbar"] {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding: var(--padding-2x);

    @include media.min-width(medium) {
      align-items: center;
      justify-content: center;
    }

    @include media.min-width(large) {
      align-items: flex-start;
      justify-content: flex-start;
      padding: 0;
    }
  }
</style>
