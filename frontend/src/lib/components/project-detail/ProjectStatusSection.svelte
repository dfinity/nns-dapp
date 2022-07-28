<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import ParticipateSwapModal from "../../modals/sns/ParticipateSwapModal.svelte";
  import type { SnsSwapCommitment, SnsSummary } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import Icp from "../ic/ICP.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProjectStatus from "./ProjectStatus.svelte";
  import ProjectCommitment from "./ProjectCommitment.svelte";
  import ProjectTimeline from "./ProjectTimeline.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import { isNullish } from "../../utils/utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let swapCommitment: SnsSwapCommitment;
  $: swapCommitment = $projectDetailStore.swapCommitment as SnsSwapCommitment;

  let myCommitmentIcp: ICP | undefined;
  $: myCommitmentIcp =
    swapCommitment?.myCommitment !== undefined
      ? ICP.fromE8s(swapCommitment.myCommitment.amount_icp_e8s)
      : undefined;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);

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

  let displayStatus: boolean = false;
  $: displayStatus =
    !loadingSummary &&
    !loadingSwapState &&
    [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed].includes(lifecycle);
</script>

<!-- Because information might not be displayed once loaded - according the state - we do no display a spinner or skeleton -->

{#if displayStatus}
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
            <svelte:fragment slot="key"
              >{$i18n.sns_project_detail.user_commitment}</svelte:fragment
            >
            <svelte:fragment slot="value">
              <Icp icp={myCommitmentIcp} singleLine />
            </svelte:fragment>
          </KeyValuePair>
        </div>
      {/if}

      {#if lifecycle === SnsSwapLifecycle.Open}
        <button
          on:click={openModal}
          class="primary small"
          data-tid="sns-project-participate-button"
          >{$i18n.sns_project_detail.participate}</button
        >
      {/if}
    </div>
  </div>
{/if}

{#if showModal}
  <ParticipateSwapModal on:nnsClose={closeModal} />
{/if}

<style lang="scss">
  @use "../../themes/mixins/media";

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
