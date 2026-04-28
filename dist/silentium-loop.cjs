'use strict';

const defaultResetCommands = (state) => {
  state.commands = [];
};
function Action(dispatch, actionsConfig, getCommands, resetCommands = defaultResetCommands, warning = console.warn) {
  const actions = actionsConfig.map(function ActionHandlerMap([type, action]) {
    return { type, action };
  });
  const handlersGroups = groupBy(actions, "type");
  return async function ActionListener() {
    const commands = getCommands();
    if (commands === void 0 || !Array.isArray(commands)) {
      throw new Error(
        "WARNING! commands are undefined, possibly problem in you logic!"
      );
    }
    if (commands.length === 0) {
      return;
    }
    dispatch(resetCommands);
    const stateCommands = commands ? [...commands] : [];
    const unhandledCommandTypes = [];
    while (stateCommands.length > 0) {
      let commands2 = stateCommands.shift() ?? [];
      if (!Array.isArray(commands2)) {
        commands2 = [commands2];
      }
      await Promise.all(
        commands2.map(async function ActionCommandsMap(command) {
          const handlersForType = handlersGroups[command.type];
          if (handlersForType?.length) {
            for (const handler of handlersForType) {
              await handler.action(command, dispatch);
            }
          } else {
            unhandledCommandTypes.push(command.type);
          }
        })
      );
    }
    if (unhandledCommandTypes.length) {
      const unhandledTypes = [...new Set(unhandledCommandTypes)];
      warning("Unhandled commands in store!", unhandledTypes);
    }
  };
}
function groupBy(list, key) {
  return list.reduce(
    function GroupByReduce(previous, currentItem) {
      const keyValue = String(currentItem[key]);
      if (keyValue === void 0) {
        throw new Error("Group by no such key " + String(key));
      }
      if (!previous[keyValue]) {
        previous[keyValue] = [];
      }
      previous[keyValue].push(currentItem);
      return previous;
    },
    {}
  );
}

const defaultCommandPush = (state, command) => {
  state.commands.push(command);
};
function createCommand(commandPush = defaultCommandPush) {
  const buildedCommands = {
    Command(state, command) {
      return commandPush(state, command);
    },
    BatchCommand(state, commands) {
      commands.reduce(function BatchReduce(last, command) {
        return commandPush(last, command);
      }, state);
    }
  };
  return buildedCommands;
}

exports.Action = Action;
exports.createCommand = createCommand;
//# sourceMappingURL=silentium-loop.cjs.map
