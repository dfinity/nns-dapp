import FollowSnsNeuronsModal from "$lib/modals/sns/neurons/FollowSnsNeuronsModal.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { FollowSnsNeuronsModalPo } from "$tests/page-objects/FollowSnsNeuronsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import type { SnsNervousSystemFunction } from "@dfinity/sns";

describe("FollowSnsNeuronsModal", () => {
  const neuron = {
    ...mockSnsNeuron,
  };
  const rootCanisterId = mockPrincipal;
  const reload = vi.fn();

  const renderComponent = ({ onClose }: { onClose?: () => void }) => {
    const { container, component } = renderSelectedSnsNeuronContext({
      Component: FollowSnsNeuronsModal,
      reload,
      neuron,
      props: {
        rootCanisterId,
        neuron,
      },
    });
    if (onClose) {
      component.$on("nnsClose", onClose);
    }
    return FollowSnsNeuronsModalPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetSnsProjects();
  });

  it("renders title", async () => {
    const po = renderComponent({});
    expect(await po.getModalTitle()).toBe("Follow neurons");
  });

  it("close button closes modal", async () => {
    const onClose = vi.fn();
    const po = renderComponent({ onClose });

    expect(onClose).not.toBeCalled();
    await po.clickCloseButton();
    expect(onClose).toBeCalledTimes(1);
  });

  it("renders spinner if no functions to follow", async () => {
    const po = renderComponent({});
    expect(await po.hasSpinner()).toBe(true);
  });

  it("displays the functions to follow", async () => {
    const function0: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: 0n,
    };
    const function1: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: 1n,
    };
    const function2: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: 2n,
    };
    setSnsProjects([
      {
        rootCanisterId,
        nervousFunctions: [function0, function1, function2],
      },
    ]);

    const po = renderComponent({});
    expect(await po.getFollowTopicSectionPo(function0.id).isPresent()).toBe(
      true
    );
    expect(await po.getFollowTopicSectionPo(function1.id).isPresent()).toBe(
      true
    );
    expect(await po.getFollowTopicSectionPo(function2.id).isPresent()).toBe(
      true
    );
  });
});
