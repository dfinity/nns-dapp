<script lang="ts">
  import { Proposal, ProposalInfo, ProposalStatus, Topic } from "@dfinity/nns";
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import Badge from "../lib/components/ui/Badge.svelte";
  import Card from "../lib/components/ui/Card.svelte";
  import CardBlock from "../lib/components/ui/CardBlock.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { PROPOSAL_COLOR } from "../lib/constants/proposals.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { getProposalInfo } from "../lib/services/proposals.services";
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { formatICP } from "../lib/utils/icp.utils";
  import {
    proposalFirstActionKey,
    proposalActionFields,
    formatProposalSummary,
  } from "../lib/utils/proposals.utils";
  import { routeContext } from "../lib/utils/route.utils";

  let proposalInfo: ProposalInfo;
  let proposal: Proposal;
  let status: ProposalStatus;

  // TODO: refactor
  $: if (proposalInfo) {
    proposal = proposalInfo.proposal;
    status = proposalInfo.status;
  }
  $: color = PROPOSAL_COLOR[status];

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      // TODO: TBD
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const unsubscribe = routeStore.subscribe(async () => {
    // TODO: fix /0
    const proposalParam = parseInt(routeContext().split("/").pop(), 10);
    if (!proposalParam) {
      routeStore.replace({ path: AppPath.Proposals });
      return;
    }

    // TODO: move to service?
    try {
      proposalInfo = await getProposalInfo({
        proposalId: BigInt(proposalParam),
      });

      if (!proposalInfo) {
        throw new Error("Proposal not found");
      }

      // console.log(stringifyJson({ value: proposalInfo }));
    } catch (error) {
      console.error(error);

      toastsStore.show({
        labelKey: "error.proposal_not_found",
        level: "error",
        detail: `id: "${proposalParam}"`,
      });

      // to not refetch on navigation
      unsubscribe();

      setTimeout(() => {
        routeStore.replace({ path: AppPath.Proposals });
      }, 1500);
    }
  });

  onDestroy(unsubscribe);

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Proposals,
    });
  };
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">Proposal</svelte:fragment>

    <section>
      <!-- TODO: i18n labels -->
      {#if proposalInfo}
        <!-- ProposalStateCard -->
        <Card>
          <h2 slot="start" class="headline">{proposal?.title}</h2>
          <Badge slot="end" {color}
            >{status ? $i18n.status[ProposalStatus[status]] : ""}</Badge
          >

          <CardBlock>
            <!-- TODO: implement expandable -- https://dfinity.atlassian.net/browse/L2-270 -->
            <h3 class="block-title" slot="title">Proposal Summary</h3>
            <p class="summary">
              {@html formatProposalSummary(proposal?.summary)}
            </p>
          </CardBlock>

          <div class="meta">
            <a class="TODO_color-blue" href={proposal.url}>{"proposal.url"}</a>

            <!-- TODO: show neuron modal https://dfinity.atlassian.net/browse/L2-282 -->
            <a
              class="TODO_color-blue"
              href="TODO: show NeuronInfoWidget(proposal.proposer)"
              >Proposer: {proposalInfo.proposer}</a
            >
            <p>
              <!-- TODO: util? -->
              Topic: {$i18n.topics[Topic[proposalInfo.topic]]?.replace(
                "Topic.",
                ""
              )}
            </p>
            <p>Id: {proposalInfo.id}</p>
          </div>

          <CardBlock>
            <h3 class="block-title" slot="title">
              {proposalFirstActionKey(proposal)}
            </h3>
            <div>
              <ul>
                {#each proposalActionFields(proposal) as [key, value]}
                  <li>
                    <h4>{key}</h4>
                    <p>{value}</p>
                  </li>
                {/each}
              </ul>
            </div>
          </CardBlock>
        </Card>

        <!-- TODO: Adop/Reject card content -- https://dfinity.atlassian.net/browse/L2-269 -->
        <Card>
          <CardBlock>
            <h3>
              Adopt <span>{`${formatICP(proposalInfo.latestTally.yes)}`}</span>
            </h3>

            <h3>
              Reject <span>{`${formatICP(proposalInfo.latestTally.no)}`}</span>
            </h3>

            <!-- TODO: Add to the same block - if (votedNeurons.isNotEmpty) -->
            <h2>My Votes</h2>
            <!-- final vote = e.voteForProposal(proposal);
              final image = (vote == Vote.YES)
              ? "assets/thumbs_up.svg"
              : "assets/thumbs_down.svg";
              final color = (vote == Vote.YES)
              ? Color(0xff80ACF8)
              : Color(0xffED1E78);
              return Row( -->
          </CardBlock>

          <!-- TODO: implement MyVotesCard https://dfinity.atlassian.net/browse/L2-283 -->
          <CardBlock>MyVotesCard</CardBlock>
        </Card>

        <!-- TODO: implement CastVoteWidget -- https://dfinity.atlassian.net/browse/L2-281 -->
        <!-- if (notVotedNeurons.isNotEmpty && latestProposal.status == ProposalStatus.Open) -->
        <!-- CastVoteWidget(proposal: latestProposal, neurons: notVotedNeurons) -->
        <Card>
          <h3 slot="title">Cast Vote</h3>
          neurons voting power
          <!-- ...widget.neurons.map((n)  -->
          <!-- 'You are about to cast $numVotes votes against this proposal, are you sure you want to proceed? ' -->
          total
        </Card>

        <!-- TODO: implement IneligibleNeuronsWidget -- https://dfinity.atlassian.net/browse/L2-284 -->
        <!-- if (ineligibleNeurons.isNotEmpty && latestProposal.status == ProposalStatus.Open) IneligibleNeuronsWidget(ineligibleNeurons: ineligibleNeurons) -->
        <Card>
          <h3>Ineligible Neurons</h3>
          <p>
            The following neurons had a dissolve delay of less than 6 months at
            the time the proposal was submitted, or were created after the
            proposal was submitted, and therefore are not eligible to vote on
            it:
          </p>
          <!-- ...ineligibleNeurons.map((p) => TableRow(children: [... -->
        </Card>
      {:else}
        <div class="spinner">
          <Spinner />
        </div>
      {/if}
    </section>

    <svelte:fragment slot="footer" />
  </HeadlessLayout>
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/media";

  .headline {
    font-size: var(--font-size-h5);
    line-height: var(--line-height-standard);
    overflow-wrap: break-word;

    @include media.min-width(medium) {
      margin-top: calc(0.5 * var(--padding));
      font-size: var(--font-size-h3);
    }
  }

  .block-title {
    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h3);
    }
  }

  .summary {
    font-size: var(--font-size-small);
    color: var(--gray-100);
    white-space: break-spaces;

    @include media.min-width(medium) {
      font-size: var(--font-size-small);
    }

    :global(a) {
      font-size: var(--font-size-small);
      color: var(--blue-400);
      line-height: var(--line-height-standard);
      text-decoration: none;
    }
  }

  .meta {
    margin: calc(3 * var(--padding)) 0;

    a,
    p {
      margin: 0 0 calc(0.5 * var(--padding));
      display: block;

      font-size: var(--font-size-h5);
      line-height: var(--line-height-standard);
      text-decoration: none;
      color: var(--gray-100);

      @include media.min-width(medium) {
        font-size: var(--font-size-h4);
      }
    }
    a {
      margin: -2px -5px;
      padding: 2px 5px;
      width: fit-content;
      border-radius: calc(0.5 * var(--border-radius));

      &:hover {
        background: var(--background-tint);
      }
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin-bottom: var(--padding);

      h4 {
        font-size: var(--font-size-ultra-small);
        color: var(--background-contrast);
        line-height: 1;

        @include media.min-width(medium) {
          font-size: var(--font-size-small);
        }
      }
      p {
        font-size: var(--font-size-ultra-small);
        color: var(--gray-100);

        @include media.min-width(medium) {
          font-size: var(--font-size-small);
        }
      }
    }
  }
</style>
