import SnsFollowee from "$lib/components/sns-neuron-detail/SnsFollowee.svelte";
import { SnsFolloweePo } from "$tests/page-objects/SnsFollowee.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("SnsFollowee", () => {
  let copySpy;

  beforeEach(() => {
    copySpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: copySpy,
      },
    });
  });

  const renderComponent = (neuronId) => {
    const { container } = render(SnsFollowee, {
      followee: {
        neuronIdHex: neuronId,
        nsFunctions: [
          {
            id: 1n,
            name: "Motion",
          },
        ],
      },
    });
    return SnsFolloweePo.under(new JestPageObjectElement(container));
  };

  it("should have a copy button", async () => {
    const neuronId = "12ab";
    const po = renderComponent(neuronId);
    expect(await po.getHashPo().hasCopyButton()).toBe(true);

    expect(copySpy).not.toBeCalled();
    await po.getHashPo().copy();
    expect(copySpy).toBeCalledWith(neuronId);
  });
});
