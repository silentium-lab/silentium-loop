import { beforeEach, describe, expect, test, TestContext, vi } from "vitest";
import { Actions, Command } from "../src";

declare module "vitest" {
  export interface TestContext {
    store: any;
  }
}

describe("Use Cases", () => {
  beforeEach((context: TestContext) => {
    context.store = {
      state: {
        a: 1,
        b: 2,
      },
      dispatch(fn: any) {
        context.store.state = fn(context.store.state);
      },
    };
  });

  test("main", async ({ store }) => {
    const startAction = vi.fn();
    const dispatch = Actions(store.dispatch, [["start", startAction]]);
    await dispatch((state: any) => {
      return Command(state, {
        type: "start",
      });
    });
    expect(startAction).toBeCalled();
  });

  test("arguments transfer", async ({ store }) => {
    const fetchAction = vi.fn();
    const dispatch = Actions(store.dispatch, [["fetch", fetchAction]]);
    await dispatch((state: any) => {
      return Command(state, {
        type: "fetch",
        args: ["/api/test"],
      });
    });
    expect(fetchAction).toBeCalled();
    expect(fetchAction).toBeCalledWith(
      {
        type: "fetch",
        args: ["/api/test"],
      },
      expect.anything(),
    );
  });

  test("computing", async ({ store }) => {
    const dispatch = Actions(store.dispatch, []);
    const state: any = await dispatch((state: any) => {
      state.c = state.a + state.b;
      return state;
    });
    expect(state.c).toBe(3);
  });

  test("unhandled types", async ({ store }) => {
    const warn = vi.fn();
    const dispatch = Actions(store.dispatch, [], warn);
    await dispatch((state: any) => {
      return Command(state, {
        type: "fetch",
        args: ["/api/test"],
      });
    });
    expect(warn).toBeCalledWith("Unhandled commands in store!", ["fetch"]);
  });
});
