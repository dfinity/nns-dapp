<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import CardFrame from "$lib/components/launchpad/CardFrame.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
  import { loadSnsFinalizationStatus } from "$lib/services/sns-finalization.services";
  import { i18n } from "$lib/stores/i18n";
  import { formatUsdValue, formatPercentage } from "$lib/utils/format.utils";
  import {
    snsProjectIcpInTreasuryPercentage,
    snsProjectWeeklyProposalActivity,
  } from "$lib/utils/projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import {
    IconAccountBalance,
    IconCoin,
    IconRight,
    IconStar,
    IconVote,
    IconWallet,
  } from "@dfinity/gix-components";
  import { ICPToken, isNullish, nonNullish, TokenAmount } from "@dfinity/utils";
  import { onMount } from "svelte";

  type Props = {
    project: SnsFullProject;
  };

  const { project }: Props = $props();
  const { summary, swapCommitment, rootCanisterId } = $derived(project);
  const {
    metadata: { logo, name, description },
    ledgerCanisterId,
  } = $derived(summary);
  const href = $derived(
    `${AppPath.Project}/?project=${project.rootCanisterId.toText()}`
  );
  const formattedMarketCapUsd = $derived.by(() => {
    const totalSupplyE8s =
      $snsTotalSupplyTokenAmountStore[rootCanisterId.toText()]?.toE8s();
    const totalSupply = nonNullish(totalSupplyE8s)
      ? Number(totalSupplyE8s) / E8S_PER_ICP
      : undefined;
    const tokenPriceUsd =
      nonNullish(ledgerCanisterId) &&
      nonNullish($icpSwapUsdPricesStore) &&
      $icpSwapUsdPricesStore !== "error"
        ? $icpSwapUsdPricesStore[ledgerCanisterId.toText()]
        : undefined;

    if (isNullish(totalSupply) || isNullish(tokenPriceUsd)) return "-/-";

    return formatCurrencyNumber(totalSupply * tokenPriceUsd);
  });
  const icpInTreasury = $derived(snsProjectIcpInTreasuryPercentage(project));
  const userCommitmentIcp = $derived.by(() => {
    const myCommitment = getCommitmentE8s(swapCommitment);
    if (isNullish(myCommitment)) {
      return undefined;
    }
    return TokenAmount.fromE8s({ amount: myCommitment, token: ICPToken });
  });
  const userHasParticipated = $derived(
    nonNullish(userCommitmentIcp) && userCommitmentIcp.toE8s() > 0n
  );
  const proposalActivity = $derived(snsProjectWeeklyProposalActivity(project));

  onMount(() => {
    loadSnsFinalizationStatus({ rootCanisterId: rootCanisterId });
  });
</script>

<CardFrame
  testId="project-card-component"
  highlighted={userHasParticipated}
  mobileHref={href}
>
  <div class="card-content" class:userHasParticipated>
    <div class="header">
      <Logo src={logo} alt={$i18n.sns_launchpad.project_logo} size="big" />
      <h3 data-tid="project-name">{name}</h3>
      <div class="fav-icon">
        <!-- TODO(launchpad2): Should be clickable and toggle favorite state -->
        <IconStar size="20px" />
      </div>
    </div>

    <p data-tid="project-description" class="description">{description}</p>

    <ul class="stats">
      <li class="stat-item">
        <h6 class="stat-label"
          >{$i18n.launchpad_cards.project_card_market_cap}</h6
        >
        <div class="stat-value">
          <IconCoin size="16px" />
          <span data-tid="token-market-cap">${formattedMarketCapUsd}</span>
        </div>
      </li>
      <li class="stat-item">
        <h6 class="stat-label"
          >{$i18n.launchpad_cards.project_card_icp_in_treasury}</h6
        >
        <div class="stat-value">
          <IconAccountBalance size="16px" />
          {#if nonNullish(icpInTreasury)}
            <span data-tid="icp-in-treasury-value"
              >{formatPercentage(icpInTreasury, {
                minFraction: 0,
                maxFraction: 2,
              })}</span
            >
          {:else}
            <span data-tid="icp-in-treasury-not-applicable"
              >{$i18n.core.not_applicable}</span
            >
          {/if}
        </div>
      </li>
      <li class="stat-item">
        {#if userHasParticipated && nonNullish(userCommitmentIcp)}
          <h6 class="stat-label"
            >{$i18n.launchpad_cards.project_card_my_participation}</h6
          >
          <div class="stat-value" data-tid="user-commitment-icp-value">
            <IconVote size="16px" />
            <AmountDisplay amount={userCommitmentIcp} singleLine inline />
          </div>
        {:else}
          <h6 class="stat-label"
            >{$i18n.launchpad_cards.project_card_proposal_activity}</h6
          >
          <div class="stat-value" data-tid="proposal-activity">
            <IconWallet size="16px" />
            <span class="proposal-activity">
              {#if nonNullish(proposalActivity)}
                <span data-tid="proposal-activity-value"
                  >{proposalActivity}</span
                ><span class="unit">/{$i18n.core.week}</span>
              {:else}
                <span data-tid="proposal-activity-not-available"
                  >{$i18n.core.not_applicable}</span
                >
              {/if}
            </span>
          </div>
        {/if}
      </li>
    </ul>

    <div class="footer">
      <!-- TODO(launchpad2): Should be clickable and toggle favorite state -->
      <button class="ghost with-icon"><IconStar size="20px" /> Watch</button>
      <a
        {href}
        class="link"
        aria-label={$i18n.core.view}
        data-tid="project-link"
      >
        <span>{$i18n.core.view}</span>
        <IconRight />
      </a>
    </div>
  </div>
</CardFrame>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "../../themes/mixins/launchpad";

  .card-content {
    @include launchpad.card_content;

    // Make the last row always be at the bottom of the card
    grid-template-rows: auto auto 1fr;

    &.userHasParticipated .stats .stat-item {
      border-right-color: var(--tertiary);
    }

    .header {
      @include launchpad.card_content_header;

      --logo-size: var(--padding-4x);
      @include media.min-width(medium) {
        --logo-size: 40px;
      }

      h3 {
        margin: 0;
        padding: 0;
        @include launchpad.text_h3;
        @include text.truncate;
      }

      .fav-icon {
        @include media.min-width(medium) {
          display: none;
        }
      }
    }

    .description {
      margin-top: 0;
      color: var(--color-text-secondary);

      @include launchpad.text_h5;
      @include text.clamp(2);
    }

    .stats {
      padding: 0;
      list-style: none;
      display: flex;

      // margin-bottom: auto;
      margin-top: auto;
      @include media.min-width(medium) {
        margin-top: 0;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--padding-0_5x);

        padding: 0 var(--padding);
        border-right: 1px solid var(--elements-divider);

        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          padding-right: 0;
          border-right: none;
        }

        h6 {
          @include launchpad.text_h6;
          margin: 0;
        }

        .stat-value {
          @include launchpad.text_h4;

          display: flex;
          align-items: center;
          gap: var(--padding-0_5x);
        }
      }

      .proposal-activity {
        .unit {
          @include launchpad.text_small;
          text-transform: lowercase;
        }
      }
    }

    .footer {
      display: none;
      justify-content: space-between;
      align-items: end;

      @include media.min-width(medium) {
        display: flex;
      }

      .link,
      button {
        @include launchpad.text_button;

        color: var(--button-secondary-color);

        display: flex;
        align-items: center;
        gap: var(--padding-0_5x);
      }
    }
  }
</style>
