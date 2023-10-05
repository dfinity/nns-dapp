import type { PostMessageResponse } from "$lib/types/post-messages";
import { TimerWorkerUtils } from "$lib/worker-utils/timer.worker-utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { advanceTime } from "$vitests/utils/timers.test-utils";
import { silentConsoleErrors } from "$vitests/utils/utils.test-utils";
import { AuthClient } from "@dfinity/auth-client";
import { mock } from "vitest-mock-extended";

describe("timer.worker-utils", () => {
  const now = Date.now();

  let spyPostMessage;

  beforeEach(() => {
    silentConsoleErrors();

    vi.clearAllTimers();
    vi.useFakeTimers().setSystemTime(now);

    spyPostMessage = vi.fn();
    global.postMessage = spyPostMessage;
  });

  describe("without identity", () => {
    const mockAuthClient = mock<AuthClient>();
    mockAuthClient.isAuthenticated.mockResolvedValue(false);

    beforeEach(() =>
      vi
        .spyOn(AuthClient, "create")
        .mockImplementation(async (): Promise<AuthClient> => mockAuthClient)
    );

    it("should not call if no identity", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(job).not.toHaveBeenCalled();
    });
  });

  describe("with identity", () => {
    const mockAuthClient = mock<AuthClient>();
    mockAuthClient.isAuthenticated.mockResolvedValue(true);
    mockAuthClient.getIdentity.mockResolvedValue(mockIdentity as never);

    beforeEach(() =>
      vi
        .spyOn(AuthClient, "create")
        .mockImplementation(async (): Promise<AuthClient> => mockAuthClient)
    );

    it("should call job on start", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(job).toHaveBeenCalledTimes(1);
    });

    it("should not call job if already started", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(job).toHaveBeenCalledTimes(1);

      const anotherJob = vi.fn();

      await worker.start({
        job: anotherJob,
        data: {},
        interval: 5000,
      });

      expect(anotherJob).not.toHaveBeenCalled();
    });

    it("should call job after interval", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(job).toHaveBeenCalledTimes(1);

      // wait for 5 seconds
      await advanceTime(5000);

      expect(job).toHaveBeenCalledTimes(2);

      // wait for 5 seconds
      await advanceTime(5000);

      expect(job).toHaveBeenCalledTimes(3);
    });

    it("should call job with identity and data", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();
      const data = { test: 123 };

      await worker.start({
        job,
        data,
        interval: 5000,
      });

      expect(job).toBeCalledWith({ identity: mockIdentity, data });
    });

    it("should call job after interval with same parameter", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      const data = { test: 123 };

      await worker.start({
        job,
        data,
        interval: 5000,
      });

      expect(job).toBeCalledWith({ identity: mockIdentity, data });

      job.mockClear();

      // wait for 5 seconds
      await advanceTime(5000);

      expect(job).toBeCalledWith({ identity: mockIdentity, data });

      job.mockClear();

      // wait for 5 seconds
      await advanceTime(5000);

      expect(job).toBeCalledWith({ identity: mockIdentity, data });
    });

    it("should stop timer", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(job).toHaveBeenCalledTimes(1);

      worker.stop();

      // wait for 5 seconds
      await advanceTime(5000);

      expect(job).toHaveBeenCalledTimes(1);
    });

    it("should stop timer on job error", async () => {
      const worker = new TimerWorkerUtils();

      let call = 0;
      const job = vi.fn(async () => {
        // Job is executed and scheduled, we want to test the error if it throw an error in the scheduler
        if (call > 0) {
          throw new Error("Test");
        }

        call++;
      });

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(job).toHaveBeenCalledTimes(1);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((worker as any).timer).not.toBeUndefined();

      await advanceTime(5000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((worker as any).timer).toBeUndefined();
    });

    it("should call postMessage when status changes", async () => {
      const worker = new TimerWorkerUtils();

      const job = vi.fn();

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(spyPostMessage).toHaveBeenCalledTimes(2);
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "in_progress",
        },
      });
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "idle",
        },
      });
    });

    it("should allow call to postMessage when timer is not idle", async () => {
      const worker = new TimerWorkerUtils();

      const testMsg: { msg: PostMessageResponse; data: { value: string } } = {
        msg: "nnsSyncTransactions",
        data: { value: "test" },
      };

      const job = async () => worker.postMsg(testMsg);

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(spyPostMessage).toHaveBeenCalledTimes(3);

      // Start
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "in_progress",
        },
      });

      // Job is over
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "idle",
        },
      });

      expect(spyPostMessage).toHaveBeenCalledWith(testMsg);
    });

    it("should not allow call to postMessage when timer is already idle", async () => {
      const worker = new TimerWorkerUtils();

      const testMsg: { msg: PostMessageResponse; data: { value: string } } = {
        msg: "nnsSyncTransactions",
        data: { value: "test" },
      };

      const job = async () => {
        worker.stop();
        worker.postMsg(testMsg);
      };

      await worker.start({
        job,
        data: {},
        interval: 5000,
      });

      expect(spyPostMessage).toHaveBeenCalledTimes(3);

      // Start
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "in_progress",
        },
      });

      // Within the job we call stop
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "idle",
        },
      });

      // Job is over
      expect(spyPostMessage).toHaveBeenCalledWith({
        msg: "nnsSyncStatus",
        data: {
          state: "idle",
        },
      });

      expect(spyPostMessage).not.toHaveBeenCalledWith(testMsg);
    });
  });
});
