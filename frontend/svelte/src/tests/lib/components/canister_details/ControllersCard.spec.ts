/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import ControllersCard from "./ControllersCardTest.svelte";

describe("ControllersCard", () => {
  it("renders title", () => {
    const { queryByText } = render(ControllersCard, {
      props: { controllers: [] },
    });

    expect(queryByText(en.canister_detail.controllers)).toBeInTheDocument();
  });

  it("renders controllers", () => {
    const controllers = [
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      "rrkah-fqaaa-aaaaa-aaaaq-cai",
    ];
    const { queryByText } = render(ControllersCard, {
      props: { controllers },
    });

    expect(queryByText(controllers[0])).toBeInTheDocument();
    expect(queryByText(controllers[1])).toBeInTheDocument();
  });
});
