<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import ParticipateSwapModal from "../../modals/sns/ParticipateSwapModal.svelte";
  import type { SnsSummary, SnsSwapCommitment } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { nowInSeconds } from "../../utils/neuron.utils";
  import Icp from "../ic/ICP.svelte";
  import InfoContextKey from "../ui/InfoContextKey.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProgressBar from "../ui/ProgressBar.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import ProjectStatus from "./ProjectStatus.svelte";
  import CommitmentProgressBar from "./CommitmentProgressBar.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary;
  // type safety validation is done in ProjectDetail component
  $: summary = $projectDetailStore.summary as SnsSummary;
  let swapCommitment: SnsSwapCommitment;
  $: swapCommitment = $projectDetailStore.swapCommitment as SnsSwapCommitment;

  const nowSeconds: number = nowInSeconds();
  let currentCommitment: bigint;
  $: currentCommitment = swapCommitment?.currentCommitment ?? BigInt(0);
  let currentCommitmentIcp: ICP;
  $: currentCommitmentIcp = ICP.fromE8s(currentCommitment);
  let myCommitmentIcp: ICP | undefined;
  $: myCommitmentIcp =
    swapCommitment?.myCommitment !== undefined
      ? ICP.fromE8s(swapCommitment.myCommitment)
      : undefined;
  let currentDateTillStartSeconds: number;
  $: currentDateTillStartSeconds = Number(
    BigInt(nowSeconds) - summary.swapStart
  );
  let deadlineTillStartSeconds: number;
  $: deadlineTillStartSeconds = Number(
    summary.swapDeadline - summary.swapStart
  );
  let durationTillDeadline: bigint;
  $: durationTillDeadline = summary.swapDeadline - BigInt(nowSeconds);

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

{#if swapCommitment === undefined}
  <div class="wrapper">
    <Spinner inline />
  </div>
{:else}
  <div class="wrapper" data-tid="sns-project-detail-status">
    <ProjectStatus />

    <div class="content">
      <KeyValuePair testId="sns-project-current-commitment">
        <InfoContextKey slot="key">
          <svelte:fragment slot="header"
            >{$i18n.sns_project_detail.current_commitment}</svelte:fragment
          >
          <p>Some details about what the current commitment means.</p>
        </InfoContextKey>
        <Icp slot="value" icp={currentCommitmentIcp} singleLine />
      </KeyValuePair>
      <div data-tid="sns-project-commitment-progress">
        <CommitmentProgressBar
          value={currentCommitment}
          max={summary.maxCommitment}
          minimumIndicator={summary.minCommitment}
        />
      </div>
      {#if durationTillDeadline > 0}
        <div>
          <ProgressBar
            value={currentDateTillStartSeconds}
            max={deadlineTillStartSeconds}
            color="blue"
          >
            <p slot="top" class="push-apart">
              <span>
                {$i18n.sns_project_detail.deadline}
              </span>
              <span>
                {secondsToDuration(durationTillDeadline)}
              </span>
            </p>
          </ProgressBar>
        </div>
      {/if}
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
      <button
        on:click={openModal}
        class="primary small"
        data-tid="sns-project-participate-button"
        >{$i18n.sns_project_detail.participate}</button
      >
    </div>
  </div>
{/if}

{#if showModal}
  <ParticipateSwapModal on:nnsClose={closeModal} />
{/if}

<style lang="scss">
  @use "../../themes/mixins/media";

  p {
    margin: 0;
  }

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

  .push-apart {
    display: flex;
    justify-content: space-between;
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
