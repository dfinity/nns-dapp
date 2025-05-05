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
              topic: "CriticalDappOperations",
              name: "CriticalDappOperations",
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: "TreasuryAssetManagement",
              name: "TreasuryAssetManagement",
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: "DaoCommunitySettings",
              name: "DaoCommunitySettings",
              description: "",
              isCritical: false,
            }),
            topicInfoDtoMock({
              topic: "ApplicationBusinessLogic",
              name: "ApplicationBusinessLogic",
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
      "CriticalDappOperations",
      "TreasuryAssetManagement",
    ]);

    expect(await po.getNonCriticalTopicNames()).toEqual([
      "ApplicationBusinessLogic",
      "DaoCommunitySettings",
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
