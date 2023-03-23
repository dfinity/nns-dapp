/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { mockAuthStoreNoIdentitySubscribe } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsProposalDetailPo } from "$tests/page-objects/SnsProposalDetail.page-object";
import { AnonymousIdentity } from "@dfinity/agent";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns-governance.api");

describe("SnsProposalDetail", () => {
  fakeSnsGovernanceApi.install();

  describe("not logged in", () => {
    const rootCanisterId = mockCanisterId;
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreNoIdentitySubscribe);
      page.mock({ data: { universe: rootCanisterId.toText() } });
    });

    it("should show skeleton while loading proposal", async () => {
      const proposalId = { id: BigInt(3) };
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });

      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(po.getSkeletonDetails()).not.toBeNull();
    });

    it("should render content once proposal is loaded", async () => {
      const proposalId = { id: BigInt(3) };
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });

      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(po.getSkeletonDetails()).not.toBeNull();
      expect(po.isContentLoaded()).toBe(false);

      await waitFor(() => expect(po.isContentLoaded()).toBe(true));
      expect(po.getSkeletonDetails()).toBeNull();
    });

    it("should redirect to the list of sns proposals if proposal id is not a valid id", async () => {
      render(SnsProposalDetail, {
        props: {
          proposalIdText: "invalid",
        },
      });
      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Proposals);
      });
    });

    it("should redirect to the list of sns proposals if proposal is not found", async () => {
      // There is no proposal with id 2 in the fake implementation.
      // Therefore, the page should redirect to the list of proposals.
      render(SnsProposalDetail, {
        props: {
          proposalIdText: "2",
        },
      });
      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Proposals);
      });
    });
  });
});
