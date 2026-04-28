import { CommandType } from "./Command";

export type DispatchType = (fn: (...args: any[]) => any) => any;

export type StoreActionType = (
  command: CommandType,
  dispatch: DispatchType,
) => Promise<any>;
export type StoreActionProvider = [string, StoreActionType];

const defaultResetCommands = (state: any) => {
  state.commands = [];
};

export function Action(
  dispatch: DispatchType,
  actionsConfig: StoreActionProvider[],
  getCommands: () => CommandType[],
  resetCommands: (state: any) => unknown = defaultResetCommands,
  warning = console.warn,
) {
  const actions = actionsConfig.map(function ActionHandlerMap([type, action]) {
    return { type, action };
  });
  const handlersGroups = groupBy(actions, "type");
  return async function ActionListener() {
    const commands = getCommands();
    // Where are no commands or it is not an Array
    if (commands === undefined || !Array.isArray(commands)) {
      throw new Error(
        "WARNING! commands are undefined, possibly problem in you logic!",
      );
    }
    // Nothing to do
    if (commands.length === 0) {
      return;
    }
    dispatch(resetCommands);
    const stateCommands = commands ? [...commands] : [];
    const unhandledCommandTypes: string[] = [];
    while (stateCommands.length > 0) {
      let commands = (stateCommands.shift() ?? []) as CommandType[];
      if (!Array.isArray(commands)) {
        commands = [commands];
      }
      await Promise.all(
        commands.map(async function ActionCommandsMap(command) {
          const handlersForType = handlersGroups[command.type];
          if (handlersForType?.length) {
            for (const handler of handlersForType) {
              await handler.action(command, dispatch);
            }
          } else {
            unhandledCommandTypes.push(command.type);
          }
        }),
      );
    }
    if (unhandledCommandTypes.length) {
      const unhandledTypes = [...new Set(unhandledCommandTypes)];
      warning("Unhandled commands in store!", unhandledTypes);
    }
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
