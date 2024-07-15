<script lang="ts">
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import ParticipateSwapModal from "$lib/modals/sns/sale/ParticipateSwapModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
  import { userCountryStore } from "$lib/stores/user-country.store";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import {
    hasUserParticipatedToSwap,
    participateButtonStatus,
    type ParticipationButtonStatus,
  } from "$lib/utils/projects.utils";
  import { BottomSheet } from "@dfinity/gix-components";
  import { Tooltip } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { SnsSwapLifecycle, type SnsSwapTicket } from "@dfinity/sns";
  import { nonNullish } from "@dfinity/utils";
  import { getContext } from "svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let lifecycle: number;
  $: lifecycle =
    $projectDetailStore.summary?.getLifecycle() ?? SnsSwapLifecycle.Unspecified;

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
              top={true}
            >
              <button
                class="primary"
                data-tid="sns-project-participate-button"
                disabled>{$i18n.sns_project_detail.participate}</button
              >
            </Tooltip>
          {:else if buttonStatus === "disabled-not-eligible"}
            <Tooltip
              id="sns-project-participate-button-tooltip"
              text={$i18n.sns_project_detail.not_eligible_to_participate}
              top={true}
            >
              <button
                class="primary"
                data-tid="sns-project-participate-button"
                disabled>{$i18n.sns_project_detail.participate}</button
              >
            </Tooltip>
          {:else}
            <!-- This is the "enabled" case only -->
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
  @use "@dfinity/gix-components/dist/styles/mixins/toolbar";

  .participate {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding);
  }

  [role="toolbar"] {
    @include toolbar.base;

    padding: var(--padding-2x);

    @include media.min-width(small) {
      justify-content: center;
    }

    @include media.min-width(large) {
      padding: 0;
    }
  }

  .loader {
    padding: var(--padding) 0 0;
  }
</style>
