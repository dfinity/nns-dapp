import * as governanceApi from "$lib/api/governance.api";
import EditFollowNeurons from "$lib/components/neurons/EditFollowNeurons.svelte";
import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { enumValues } from "$lib/utils/enum.utils";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { EditFollowNeuronsPo } from "$tests/page-objects/EditFollowNeurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("EditFollowNeurons", () => {
  const neuronFollowing = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: [27n, 28n],
        },
      ],
    },
  };

  const fillNeuronStore = () =>
    neuronsStore.setNeurons({
      neurons: [neuronFollowing],
      certified: true,
    });

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(governanceApi, "queryKnownNeurons").mockResolvedValue([]);
    fillNeuronStore();
  });

  const renderComponent = () => {
    const { container } = render(EditFollowNeurons, {
      props: {
        neuronId: neuronFollowing.neuronId,
      },
    });

    return EditFollowNeuronsPo.under(new JestPageObjectElement(container));
  };

  it("renders badge with numbers of followees on the topic", async () => {
    const po = renderComponent();
    expect(await po.getBadgeNumber(Topic.ExchangeRate)).toBe(2);
    expect(await po.getBadgeNumber(Topic.Governance)).toBe(0);
  });

  it("renders topics in specific order", async () => {
    const po = renderComponent();
    const sectionTitles = await po.getFollowNnsTopicTitles();

    // Deprecated + NeuronManagement (because it's not public)
    const hiddenTopicCount = DEPRECATED_TOPICS.length + 1;
    expect(sectionTitles.length).toBe(
      enumValues(Topic).length - hiddenTopicCount
    );

    expect(sectionTitles).toEqual([
      "Governance",
      "SNS & Neurons' Fund",
      "All Except Governance, and SNS & Neurons' Fund",
      "API Boundary Node Management",
      "Application Canister Management",
      "Exchange Rate",
      "IC OS Version Deployment",
      "IC OS Version Election",
      "KYC",
      "Network Economics",
      "Node Admin",
      "Node Provider Rewards",
      "Participant Management",
      "Protocol Canister Management",
      "Service Nervous System Management",
      "Subnet Management",
      "Subnet Rental",
    ]);
  });

  it("displays the followees of the user in specific topic", async () => {
    const po = renderComponent();
    const topicSectionPo = await po.getFollowTopicSectionPo(Topic.ExchangeRate);
    expect(await topicSectionPo.getCollapsiblePo().isExpanded()).toBe(false);
    await topicSectionPo.getCollapsiblePo().expand();
    expect(await topicSectionPo.getCollapsiblePo().isExpanded()).toBe(true);
  });
});
