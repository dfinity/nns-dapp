<script lang="ts">
  import { ICP } from "@dfinity/nns";
  import ParticipateSwapModal from "../../modals/sns/ParticipateSwapModal.svelte";
  import type { SnsSwapState } from "../../services/sns.mock";
  import { i18n } from "../../stores/i18n";
  import type { SnsFullProject } from "../../stores/projects.store";
  import { secondsToDuration } from "../../utils/date.utils";
  import Icp from "../ic/ICP.svelte";
  import Badge from "../ui/Badge.svelte";
  import InfoContextKey from "../ui/InfoContextKey.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProgressBar from "../ui/ProgressBar.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import CommitmentProgressBar from "./CommitmentProgressBar.svelte";

  export let project: SnsFullProject;

  let swapState: SnsSwapState | undefined;
  $: ({ swapState } = project);
  let currentCommitment: bigint;
  $: currentCommitment = swapState?.currentCommitment ?? BigInt(0);
  let currentCommitmentIcp: ICP;
  $: currentCommitmentIcp = ICP.fromE8s(currentCommitment);
  let myCommitmentIcp: ICP | undefined;
  $: myCommitmentIcp =
    swapState?.myCommitment !== undefined
      ? ICP.fromE8s(swapState?.myCommitment)
      : undefined;
  let currentDateTillStartSeconds: number;
  $: currentDateTillStartSeconds = Number(
    BigInt(Math.round(Date.now() / 1000)) - project.summary.swapStart
  );
  let deadlineTillStartSeconds: number;
  $: deadlineTillStartSeconds = Number(
    project.summary.swapDeadline - project.summary.swapStart
  );
  let durationTillDeadline: bigint;
  $: durationTillDeadline =
    project.summary.swapDeadline - BigInt(Math.round(Date.now() / 1000));

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

{#if swapState === undefined}
  <div class="wrapper">
    <Spinner inline />
  </div>
{:else}
  <div class="wrapper" data-tid="sns-project-detail-status">
    <div class="title">
      <h2>{$i18n.sns_project_detail.status}</h2>
      <!-- TODO: Create another Badge for SNS? -->
      <Badge>{$i18n.sns_project_detail.accepting}</Badge>
    </div>
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
          max={project.summary.maxCommitment}
          minimumIndicator={project.summary.minCommitment}
        />
      </div>
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
  <ParticipateSwapModal {project} on:nnsClose={closeModal} />
{/if}

<style lang="scss">
  @use "../../themes/mixins/media";

  h2 {
    margin: 0;
    line-height: var(--line-height-standard);
  }
  p {
    margin: 0;
  }

  .wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
