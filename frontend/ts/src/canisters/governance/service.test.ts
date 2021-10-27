import Service from "./Service";
import { _SERVICE } from "./rawService";
import { mock } from "jest-mock-extended";
import { Agent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

describe("getNeurons", () => {
  test("respects the certified flag", () => {
    const agent = mock<Agent>();
    const uncertified = mock<_SERVICE>();
    const res = {
      neuron_infos: [],
      full_neurons: [],
    };
    uncertified.list_neurons.mockReturnValue(
      Promise.resolve(res)
    );

    const certified = mock<_SERVICE>();
    certified.list_neurons.mockReturnValue(Promise.resolve(res));

    const dapp = new Service(
      agent,
      mock<Principal>(),
      uncertified,
      certified,
      mock<Principal>()
    );

    // Call `getNeurons` without certification and verify that the uncertified
    // service has been called.
    dapp.getNeurons(false);
    expect(uncertified.list_neurons).toBeCalledTimes(1);
    expect(certified.list_neurons).toBeCalledTimes(0);

    // Call `getNeurons` with certification and verify that the certified
    // service has been called.
    dapp.getNeurons(true);
    expect(uncertified.list_neurons).toBeCalledTimes(1);
    expect(certified.list_neurons).toBeCalledTimes(1);
  });
});
