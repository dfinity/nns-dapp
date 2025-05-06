import SnsTopicDefinitionsModal from "$lib/modals/sns/neurons/SnsTopicDefinitionsModal.svelte";
import type { SnsTopicKey } from "$lib/types/sns";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { SnsTopicDefinitionsModalPo } from "$tests/page-objects/SnsTopicDefinitionsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "@testing-library/svelte";

describe("SnsTopicDefinitionsModal", () => {
  const rootCanisterId = principal(1);
  const criticalTopicKey1: SnsTopicKey = "CriticalDappOperations";
  const criticalTopicName1 = "Critical Dapp Operations";
  const criticalTopicKey2: SnsTopicKey = "TreasuryAssetManagement";
  const criticalTopicName2 = "Treasury Asset Management";
  const topicKey1: SnsTopicKey = "DaoCommunitySettings";
  const topicName1 = "Dao Community Settings";
  const topicKey2: SnsTopicKey = "ApplicationBusinessLogic";
  const topicName2 = "Application Business Logic";

  const renderComponent = ({
    onClose = () => {},
  }: {
    onClose?: () => void;
  } = {}) => {
    const { container } = render(SnsTopicDefinitionsModal, {
      props: { rootCanisterId, onClose },
    });

    return SnsTopicDefinitionsModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId,
        topics: {
          topics: [
            topicInfoDtoMock({
              topic: criticalTopicKey1,
              name: criticalTopicName1,
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: criticalTopicKey2,
              name: criticalTopicName2,
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: topicKey1,
              name: topicName1,
              description: "",
              isCritical: false,
            }),
            topicInfoDtoMock({
              topic: topicKey2,
              name: topicName2,
              description: "",
              isCritical: false,
            }),
          ],
          uncategorized_functions: [],
        },
      },
    ]);
  });

  it("displays critical and non-critical topics", async () => {
    const po = renderComponent();

    expect([...(await po.getCriticalTopicNames())]).toEqual([
      criticalTopicName1,
      criticalTopicName2,
    ]);

    expect(await po.getNonCriticalTopicNames()).toEqual([
      topicName1,
      topicName2,
    ]);
  });

  it("emits close event", async () => {
    const onClose = vi.fn();
    const po = renderComponent({
      onClose,
    });

    await po.clickCloseButton();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
