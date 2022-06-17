/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CyclesCard from "../../../../lib/components/canister_details/CyclesCard.svelte";
import { formatCyclesToTCycles } from "../../../../lib/utils/canisters.utils";
import en from "../../../mocks/i18n.mock";

describe("CyclesCard", () => {
  it("renders title", () => {
    const { queryByText } = render(CyclesCard, {
      props: { cycles: BigInt(10) },
    });

    expect(queryByText(en.canister_detail.cycles)).toBeInTheDocument();
  });

  it("renders cycles", () => {
    const cycles = BigInt(2_000_000_000_000);
    const { queryByText } = render(CyclesCard, {
      props: { cycles },
    });

    expect(queryByText(formatCyclesToTCycles(cycles))).toBeInTheDocument();
  });
});
