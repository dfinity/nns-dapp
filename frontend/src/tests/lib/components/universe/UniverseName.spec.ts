import { CKTESTBTC_UNIVERSE } from "$lib//derived/ckbtc-universes.derived";
import UniverseName from "$lib/components/universe/UniverseName.svelte";
import { CKBTC_UNIVERSE } from "$lib/derived/ckbtc-universes.derived";
import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsFullProject,
  mockSummary,
} from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";

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

  it("shout render ckTESTBTC", () => {
    const { container } = render(UniverseName, {
      props: { universe: CKTESTBTC_UNIVERSE },
    });
    expect(container.textContent).toEqual(en.ckbtc.test_title);
  });
});
