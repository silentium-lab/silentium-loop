import { CommandType, isCommandState } from "./Command";

export type DispatchType = (fn: (...args: any[]) => any) => any;

export type StoreActionType = (
  command: CommandType,
  dispatch: DispatchType,
) => Promise<any>;
export type StoreActionProvider = [string, StoreActionType];

export function Action(
  nativeDispatch: DispatchType,
  actionsConfig: StoreActionProvider[],
  warning = console.warn,
) {
  const actions = actionsConfig.map(function ActionHandlerMap([type, action]) {
    return { type, action };
  });
  const handlersGroups = groupBy(actions, "type");
  return function ActionDispatch(fn: (...args: any[]) => any) {
    return new Promise(function ActionDispatchPromise(resolve, reject) {
      nativeDispatch(function ActionDispatchInNative(state) {
        const nextState = fn(state);
        if (nextState === undefined) {
          throw new Error("Action: dispatch callback can't return nothing ");
        }
        if (!isCommandState(nextState)) {
          resolve(nextState);
          return;
        }
        const commands = nextState.commands();
        // Where are no commands or it is not an Array
        if (commands === undefined || !Array.isArray(commands)) {
          throw new Error(
            "WARNING! commands are undefined, possibly problem in app logic!",
          );
        }
        // Nothing to do
        if (commands.length === 0) {
          return;
        }
        const unhandledCommandTypes: string[] = [];
        Promise.all(
          commands.map(async function ActionCommandsMap(command) {
            const handlersForType = handlersGroups[command.type];
            if (handlersForType?.length) {
              for (const handler of handlersForType) {
                await handler.action(command, nativeDispatch);
              }
            } else {
              unhandledCommandTypes.push(command.type);
            }
          }),
        )
          .then(function ActionDispatchAllCommandsThen() {
            if (unhandledCommandTypes.length) {
              const unhandledTypes = [...new Set(unhandledCommandTypes)];
              warning("Unhandled commands in store!", unhandledTypes);
            }
            nativeDispatch(function ActionDispatchFinish(state) {
              resolve(state);
              return state;
            });
          })
          .catch(reject);
      });
    });
  };
}

function groupBy<T, K extends keyof T>(list: T[], key: K): Record<string, T[]> {
  return list.reduce(
    function GroupByReduce(previous, currentItem) {
      const keyValue = String(currentItem[key]);
      if (keyValue === undefined) {
        throw new Error("Group by no such key " + String(key));
      }
      if (!previous[keyValue]) {
        previous[keyValue] = [];
      }
      previous[keyValue].push(currentItem);
      return previous;
    },
    {} as Record<string, T[]>,
  );
}
