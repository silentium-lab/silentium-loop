class CommandState {
  constructor(_state, _commands) {
    this._state = _state;
    this._commands = _commands;
  }
  state() {
    return this._state;
  }
  commands() {
    if (isCommandState(this._state)) {
      return this._state.commands().concat(this._commands);
    }
    return this._commands;
  }
}
function isCommandState(obj) {
  return obj instanceof CommandState;
}
function Command(state, command) {
  return new CommandState(state, [command]);
}
function BatchCommand(state, commands) {
  return new CommandState(state, commands);
}

function Actions(nativeDispatch, actionsConfig, warning = console.warn) {
  return function ActionDispatch(fn) {
    const actions = actionsConfig.map(function ActionHandlerMap([
      type,
      action
    ]) {
      return { type, action };
    });
    const handlersGroups = groupBy(actions, "type");
    return new Promise(function ActionDispatchPromise(resolve, reject) {
      nativeDispatch(function ActionDispatchInNative(state) {
        const nextState = fn(state);
        if (nextState === void 0) {
          throw new Error("Action: dispatch callback can't return nothing ");
        }
        if (!isCommandState(nextState)) {
          resolve(nextState);
          return nextState;
        }
        const commands = nextState.commands();
        if (commands === void 0 || !Array.isArray(commands)) {
          throw new Error(
            "WARNING! commands are undefined, possibly problem in app logic!"
          );
        }
        if (commands.length === 0) {
          resolve(nextState.state());
          return nextState.state();
        }
        const unhandledCommandTypes = [];
        Promise.all(
          commands.map(async function ActionCommandsMap(command) {
            const handlersForType = handlersGroups[command.type];
            if (handlersForType?.length) {
              for (const handler of handlersForType) {
                try {
                  await handler.action(command, ActionDispatch);
                } catch (e) {
                  reject(e);
                }
              }
            } else {
              unhandledCommandTypes.push(command.type);
            }
          })
        ).then(function ActionDispatchAllCommandsThen() {
          if (unhandledCommandTypes.length) {
            const unhandledTypes = [...new Set(unhandledCommandTypes)];
            warning("Unhandled commands in store!", unhandledTypes);
          }
          nativeDispatch(function ActionDispatchFinish(state2) {
            resolve(state2);
            return state2;
          });
        }).catch(reject);
        return nextState.state();
      });
    });
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

export { Actions, BatchCommand, Command, CommandState, isCommandState };
//# sourceMappingURL=silentium-loop.mjs.map
