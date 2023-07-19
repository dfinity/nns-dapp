import { CKTESTBTC_UNIVERSE } from "$lib//derived/ckbtc-universes.derived";
import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
import { CKBTC_UNIVERSE } from "$lib/derived/ckbtc-universes.derived";
import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
import {
  mockSnsFullProject,
  mockSummary,
} from "$tests/mocks/sns-projects.mock";
import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("UniversePageSummary", () => {
  const renderComponent = (universe) => {
    const { container } = render(UniversePageSummary, {
      props: { universe },
    });

    return UniversePageSummaryPo.under(new JestPageObjectElement(container));
  };

  it("shout render IC", async () => {
    const po = renderComponent(NNS_UNIVERSE);
    expect(await po.getTitle()).toEqual("Internet Computer");
  });

  it("shout render sns", async () => {
    const mockSnsUniverse = {
      summary: mockSummary,
      canisterId: mockSnsFullProject.rootCanisterId.toText(),
    };
    const po = renderComponent(mockSnsUniverse);
    expect(await po.getTitle()).toEqual("Tetris");
  });

  it("shout render ckBTC", async () => {
    const po = renderComponent(CKBTC_UNIVERSE);
    expect(await po.getTitle()).toEqual("ckBTC");
  });

  it("shout render ckTESTBTC", async () => {
    const po = renderComponent(CKTESTBTC_UNIVERSE);
    expect(await po.getTitle()).toEqual("ckTESTBTC");
  });
});
