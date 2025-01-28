import * as api from "$lib/api/governance.api";
import ConfirmFollowingButton from "$lib/components/neuron-detail/actions/ConfirmFollowingButton.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { ConfirmFollowingButtonPo } from "$tests/page-objects/ConfirmFollowingButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore } from "@dfinity/gix-components";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

describe("ConfirmFollowingButton", () => {
  const neuronId1 = 1n;
  const neuronId2 = 22n;
  const neuronIds = [neuronId1, neuronId2];
  const neurons = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockFullNeuron,
      neuronId,
      controller: mockIdentity.getPrincipal().toText(),
    },
  }));

  let spyQueryNeurons;

  beforeEach(() => {
    resetIdentity();

    neuronsStore.pushNeurons({ neurons, certified: true });
    spyQueryNeurons = vi.spyOn(api, "queryNeurons").mockResolvedValue(neurons);
    vi.spyOn(api, "refreshVotingPower").mockResolvedValue();
  });

  const renderComponent = async ({
    nnsComplete = undefined,
    ...props
  }: {
    neuronIds: bigint[];
    nnsComplete?: () => void;
  }) => {
    const { container } = render(ConfirmFollowingButton, {
      props,
      events: {
        ...(nonNullish(nnsComplete) && { nnsComplete }),
      },
    });

    return ConfirmFollowingButtonPo.under(new JestPageObjectElement(container));
  };

  it("displays the button", async () => {
    const po = await renderComponent({
      neuronIds: [neuronId1, neuronId2],
    });

    expect(await po.getText()).toBe("Confirm Following");
  });

  it("returns the refreshed neuron count", async () => {
    vi.spyOn(console, "error").mockReturnValue();

    neuronsStore.pushNeurons({ neurons, certified: true });
    let resolveRefreshVotingPower;
    const spyRefreshVotingPower = vi
      .spyOn(api, "refreshVotingPower")
      .mockRejectedValueOnce(new Error())
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveRefreshVotingPower = resolve))
      );

    expect(spyQueryNeurons).toBeCalledTimes(0);
    expect(spyRefreshVotingPower).toBeCalledTimes(0);

    const nnsComplete = vi.fn();
    const po = await renderComponent({
      neuronIds: [neuronId1, neuronId2],
      nnsComplete,
    });

    expect(get(busyStore)).toEqual([]);

    await po.click();

    // Wait for busy screen to show
    await runResolvedPromises();
    expect(get(busyStore)).toEqual([
      {
        initiator: "refresh-voting-power",
        text: "Confirming following. This may take a moment.",
      },
    ]);

    resolveRefreshVotingPower();

    // Wait for busy screen to hide
    await runResolvedPromises();
    expect(get(busyStore)).toEqual([]);

    expect(spyQueryNeurons).toBeCalledTimes(2);
    expect(spyRefreshVotingPower).toBeCalledTimes(2);

    expect(nnsComplete).toBeCalledTimes(1);
    expect(nnsComplete).toBeCalledWith(
      expect.objectContaining({
        detail: {
          successCount: 1,
          totalCount: 2,
        },
      })
    );
  });
});
