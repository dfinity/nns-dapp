/**
 * @jest-environment jsdom
 */
import UniverseName from "$lib/components/universe/UniverseName.svelte";
import {
  CKBTC_UNIVERSE,
  NNS_UNIVERSE,
} from "$lib/derived/selectable-universes.derived";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsFullProject,
  mockSummary,
} from "../../../mocks/sns-projects.mock";

describe("UniverseName", () => {
  it("shout render IC", () => {
    const { container } = render(UniverseName, {
      props: { universe: NNS_UNIVERSE },
    });
    expect(container.textContent).toEqual(en.core.ic);
  });

  it("shout render sns", () => {
    const mockSnsUniverse = {
      summary: mockSummary,
      canisterId: mockSnsFullProject.rootCanisterId.toText(),
    };

    const { container } = render(UniverseName, {
      props: { universe: mockSnsUniverse },
    });
    expect(container.textContent).toEqual(mockSummary.metadata.name);
  });

  it("shout render ckBTC", () => {
    const { container } = render(UniverseName, {
      props: { universe: CKBTC_UNIVERSE },
    });
    expect(container.textContent).toEqual(en.ckbtc.title);
  });
});
