import UniversePageSummary from "$lib/components/universe/UniversePageSummary.svelte";
import { createUniverse } from "$lib/utils/universe.utils";
import { mockSummary } from "$tests/mocks/sns-projects.mock";
import {
  ckBTCUniverseMock,
  ckTESTBTCUniverseMock,
  nnsUniverseMock,
} from "$tests/mocks/universe.mock";
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
    const po = renderComponent(nnsUniverseMock);
    expect(await po.getTitle()).toEqual("Internet Computer");
    expect(await po.getLogoUrl()).toEqual(nnsUniverseMock.logo);
    expect(await po.getLogoAlt()).toEqual("Internet Computer logo");
  });

  it("shout render sns", async () => {
    const mockSnsUniverse = createUniverse(mockSummary);
    const po = renderComponent(mockSnsUniverse);
    expect(await po.getTitle()).toEqual("Tetris");
    expect(await po.getLogoUrl()).toEqual(mockSnsUniverse.logo);
    expect(await po.getLogoAlt()).toEqual("Tetris project logo");
  });

  it("shout render ckBTC", async () => {
    const po = renderComponent(ckBTCUniverseMock);
    expect(await po.getTitle()).toEqual("ckBTC");
  });

  it("shout render ckTESTBTC", async () => {
    const po = renderComponent(ckTESTBTCUniverseMock);
    expect(await po.getTitle()).toEqual("ckTESTBTC");
  });
});
