/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import ProposalDetail from "$lib/routes/ProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import type { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";
import type { Subscriber } from "svelte/types/runtime/store";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../mocks/auth.store.mock";

describe("ProposalDetail", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  beforeEach(() => {
    // Reset to default value
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  afterAll(jest.clearAllMocks);

  it("should render NnsProposalDetail by default", () => {
    const { queryByTestId } = render(ProposalDetail, {
      props: {
        proposalIdText: undefined,
      },
    });

    expect(queryByTestId("proposal-details-grid")).toBeInTheDocument();
  });

  describe("SnsProposalDetail", () => {
    beforeAll(() => {
      jest
        .spyOn(snsProjectIdSelectedStore, "subscribe")
        .mockImplementation((run: Subscriber<Principal>): (() => void) => {
          run(mockPrincipal);
          return () => undefined;
        });
    });

    it("should render SnsProposalDetail when project provided", () => {
      const { queryByTestId } = render(ProposalDetail, {
        props: {
          proposalIdText: undefined,
        },
      });

      expect(queryByTestId("sns-proposal-details-grid")).toBeInTheDocument();
    });
  });
});
