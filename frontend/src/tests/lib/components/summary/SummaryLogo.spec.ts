/**
 * @jest-environment jsdom
 */

import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { IC_LOGO } from "$lib/constants/icp.constants";
import { page } from "$mocks/$app/stores";
import { render } from "@testing-library/svelte";
import { mockStoreSubscribe } from "../../../mocks/commont.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { mockSnsCanisterIdText } from "../../../mocks/sns.api.mock";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";

describe("SummaryLogo", () => {
  describe("nns", () => {
    beforeEach(() => page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } }));

    it("should render ic logo", () => {
      const { getByTestId } = render(SummaryLogo);

      expect(getByTestId("logo")?.getAttribute("src")).toEqual(IC_LOGO);
    });
  });

  describe("sns", () => {
    beforeAll(() =>
      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject))
    );

    beforeEach(() => page.mock({ data: { universe: mockSnsCanisterIdText } }));

    it("should render project logo", () => {
      const { getByTestId } = render(SummaryLogo);

      expect(getByTestId("logo")?.getAttribute("src")).toEqual(
        mockSnsFullProject.summary.metadata.logo
      );
    });
  });
});
