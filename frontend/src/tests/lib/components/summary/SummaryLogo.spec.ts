/**
 * @jest-environment jsdom
 */

import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { page } from "$mocks/$app/stores";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";

describe("SummaryLogo", () => {
  describe("nns", () => {
    beforeEach(() => page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } }));

    it("should render alt logo", () => {
      const { getByTestId } = render(SummaryLogo);

      expect(getByTestId("logo").getAttribute("alt")).toEqual(en.auth.ic_logo);
    });
  });

  describe("sns", () => {
    beforeAll(() => {
      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      jest
        .spyOn(snsProjectsCommittedStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));
    });

    beforeEach(() =>
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
      })
    );

    it("should render project logo", () => {
      const { getByTestId } = render(SummaryLogo);

      expect(getByTestId("logo")?.getAttribute("src")).toEqual(
        mockSnsFullProject.summary.metadata.logo
      );
    });
  });

  describe("ckBTC", () => {
    beforeAll(() => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });
    });

    it("should render ic logo", async () => {
      const { getByTestId } = render(SummaryLogo);

      expect(getByTestId("logo").getAttribute("alt")).toEqual(en.ckbtc.logo);
    });
  });
});
