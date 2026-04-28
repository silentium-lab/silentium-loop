import { beforeEach, describe, expect, test, TestContext, vi } from "vitest";
import { Action, createCommand } from "../src";

declare module "vitest" {
  export interface TestContext {
    store: any;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Use Cases", () => {
  beforeEach((context: TestContext) => {
    context.store = {
      state: {
        a: 1,
        b: 2,
        commands: [],
      },
      dispatch(fn: any) {
        fn(context.store.state);
        context.store.listeners.forEach((l: () => void) => {
          l();
        });
      },
      listeners: [],
    };
  });

  test("main", async ({ store }) => {
    const startAction = vi.fn();
    const actionsListener = Action(
      store.dispatch,
      [["start", startAction]],
      () => store.state.commands,
    );
    store.listeners.push(actionsListener);
    const { Command } = createCommand();
    store.dispatch((state: any) => {
      Command(state, {
        type: "start",
      });
    });
    await sleep(10);
    expect(startAction).toBeCalled();
  });

  test("arguments translation", async ({ store }) => {
    const fetchAction = vi.fn();
    const actionsListener = Action(
      store.dispatch,
      [["fetch", fetchAction]],
      () => store.state.commands,
    );
    store.listeners.push(actionsListener);
    const { Command } = createCommand();
    store.dispatch((state: any) => {
      Command(state, {
        type: "fetch",
        args: ["/api/test"],
      });
    });
    await sleep(10);
    expect(fetchAction).toBeCalled();
    expect(fetchAction).toBeCalledWith(
      {
        type: "fetch",
        args: ["/api/test"],
      },
      expect.anything(),
    );
  });
});
