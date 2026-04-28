export type CommandNextType = (state: any, ...rest: any[]) => any;

export type CommandFailType = (state: any, reason: any) => any;

export type CommandType = {
  type: string;
  args?: any[];
  next?: CommandNextType;
  fail?: CommandNextType;
};

export type CommandsType = (CommandType | CommandType[])[];

export type StateWithCommands = {
  commands: CommandsType;
};

export type CommandSetter<T> = (state: T, command: CommandType) => T;

const defaultSetter: CommandSetter<any> = (state, command) => {
  state.commands.push(command);
};

export function createCommand<T>(
  commandSetter: CommandSetter<T> = defaultSetter,
  returnState = true,
) {
  const buildedCommands = {
    Command(state: T, command: CommandType) {
      if (returnState) {
        return commandSetter(state, command);
      }
      commandSetter(state, command);
    },
    BatchCommand(state: T, commands: CommandType[]) {
      if (returnState) {
        return commands.reduce(function BatchReduce(last, command) {
          return commandSetter(last, command);
        }, state);
      }
      commands.reduce(function BatchReduce(last, command) {
        commandSetter(last, command);
        return last;
      }, state);
    },
  };
  return buildedCommands;
}
