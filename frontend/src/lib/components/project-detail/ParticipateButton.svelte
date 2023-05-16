<script lang="ts">
  import { SnsSwapLifecycle, type SnsSwapTicket } from "@dfinity/sns";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext } from "svelte";
  import { BottomSheet } from "@dfinity/gix-components";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import ParticipateSwapModal from "$lib/modals/sns/sale/ParticipateSwapModal.svelte";
  import {
    hasUserParticipatedToSwap,
    type ParticipationButtonStatus,
    participateButtonStatus,
  } from "$lib/utils/projects.utils";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";
  import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { userCountryStore } from "$lib/stores/user-country.store";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let lifecycle: number;
  $: ({
    swap: { lifecycle },
  } =
    $projectDetailStore.summary ??
    ({
      swap: { state: { lifecycle: SnsSwapLifecycle.Unspecified } },
    } as unknown as SnsSummary));

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = nonNullish($projectDetailStore?.summary?.rootCanisterId)
    ? $projectDetailStore?.summary?.rootCanisterId
    : undefined;

  let userHasParticipatedToSwap = false;
  $: userHasParticipatedToSwap = hasUserParticipatedToSwap({
    swapCommitment: $projectDetailStore.swapCommitment,
  });

  // TODO: Receive this as props
  let ticket: SnsSwapTicket | undefined | null = undefined;
  $: ticket = $snsTicketsStore[rootCanisterId?.toText() ?? ""]?.ticket;

  let buttonStatus: ParticipationButtonStatus = "logged-out";
  $: buttonStatus = participateButtonStatus({
    summary: $projectDetailStore.summary,
    swapCommitment: $projectDetailStore.swapCommitment,
    loggedIn: $authSignedInStore,
    userCountry: $userCountryStore,
    ticket,
  });
</script>

<TestIdWrapper testId="participate-button-component">
  {#if lifecycle === SnsSwapLifecycle.Open}
    <BottomSheet>
      <div role="toolbar">
        <SignInGuard>
          <!-- "logged-out" is handled by SignInGuard -->
          <!-- "disabled-not-open" is handled by the if above and not rendering the button -->
          {#if buttonStatus === "loading"}
            <div class="loader" data-tid="connecting_sale_canister">
              <SpinnerText
                >{$i18n.sns_sale.connecting_sale_canister}</SpinnerText
              >
            </div>
          {:else if buttonStatus === "disabled-max-participation"}
            <Tooltip
              id="sns-project-participate-button-tooltip"
              text={$i18n.sns_project_detail.max_user_commitment_reached}
            >
              <button
                class="primary"
                data-tid="sns-project-participate-button"
                disabled>{$i18n.sns_project_detail.participate}</button
              >
            </Tooltip>
            <!-- TODO: GIX-1553 Add disabled-not-eligible -->
          {:else}
            <button
              on:click={openModal}
              class="primary participate"
              data-tid="sns-project-participate-button"
            >
              {userHasParticipatedToSwap
                ? $i18n.sns_project_detail.increase_participation
                : $i18n.sns_project_detail.participate}
            </button>
          {/if}
          <span slot="signin-cta">{$i18n.sns_project_detail.sign_in}</span>
        </SignInGuard>
      </div>
    </BottomSheet>
  {/if}

  {#if showModal}
    <ParticipateSwapModal on:nnsClose={closeModal} />
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .participate {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding);
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

  .loader {
    padding: var(--padding) 0 0;
  }
</style>
