/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type { PostMessage } from "$lib/types/post-messages";
import { page } from "$mocks/$app/stores";
import SnsWalletBalancesObserverTest from "$tests/lib/components/accounts/SnsWalletBalancesObserverTest.svelte";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("SnsWalletBalancesObserver", () => {
  type BalancesMessageEvent = MessageEvent<
    PostMessage<PostMessageDataResponseBalances | PostMessageDataResponseSync>
  >;

  class PostMessageMock {
    private _callback: (params: BalancesMessageEvent) => Promise<void>;

    subscribe(callback: (params: BalancesMessageEvent) => Promise<void>) {
      this._callback = callback;
    }

    emit(params: BalancesMessageEvent) {
      this._callback(params);
    }
  }

  let postMessageMock: PostMessageMock;

  beforeEach(() => {
    jest
      .spyOn(snsProjectsStore, "subscribe")
      .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

    page.mock({
      routeId: AppPath.Wallet,
      data: { universe: rootCanisterIdMock.toText() },
    });

    postMessageMock = new PostMessageMock();

    jest.mock("$lib/workers/balances.worker?worker", () => {
      return class BalancesWorker {
        constructor() {
          postMessageMock.subscribe(async (msg) => await this.onmessage(msg));
        }

        postMessage(_data: {
          msg: "nnsStartBalancesTimer" | "nnsStopBalancesTimer";
          data?: PostMessageDataRequestBalances;
        }) {
          // Nothing here
        }

        onmessage = async (
          _params: MessageEvent<
            PostMessage<
              PostMessageDataResponseBalances | PostMessageDataResponseSync
            >
          >
        ) => {
          // Nothing here
        };
      };
    });
  });

  it("should init data and render slotted content", async () => {
    const { getByTestId } = render(SnsWalletBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });

  it("should update account store on new message", async () => {
    const { getByTestId } = render(SnsWalletBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });
});
