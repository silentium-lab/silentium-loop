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

const defaultCommandPush: CommandSetter<any> = (state, command) => {
  state.commands.push(command);
};

export function createCommand<T>(
  commandPush: CommandSetter<T> = defaultCommandPush,
) {
  const buildedCommands = {
    Command(state: T, command: CommandType) {
      return commandPush(state, command);
    },
    BatchCommand(state: T, commands: CommandType[]) {
      commands.reduce(function BatchReduce(last, command) {
        return commandPush(last, command);
      }, state);
    },
  };
  return buildedCommands;
}
