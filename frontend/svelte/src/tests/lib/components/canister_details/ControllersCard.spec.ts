/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ControllersCard from "../../../../lib/components/canister_details/ControllersCard.svelte";
import { mockCanisterDetails } from "../../../mocks/canisters.mock";
import en from "../../../mocks/i18n.mock";

describe("ControllersCard", () => {
  it("renders title", () => {
    const { queryByText } = render(ControllersCard, {
      props: { canisterDetails: mockCanisterDetails },
    });

    expect(queryByText(en.canister_detail.controllers)).toBeInTheDocument();
  });

  it("renders controllers", () => {
    const controllers = [
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      "rrkah-fqaaa-aaaaa-aaaaq-cai",
    ];
    const canister = {
      ...mockCanisterDetails,
      setting: {
        ...mockCanisterDetails.setting,
        controllers,
      },
    };
    const { queryByText } = render(ControllersCard, {
      props: { canisterDetails: canister },
    });

    expect(queryByText(controllers[0])).toBeInTheDocument();
    expect(queryByText(controllers[1])).toBeInTheDocument();
  });
});
