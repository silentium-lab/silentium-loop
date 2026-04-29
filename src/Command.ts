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

export class CommandState<T> {
  public constructor(
    private _state: T | CommandState<T>,
    private _commands: CommandType[],
  ) {}

  public state() {
    return this._state;
  }

  public commands(): CommandType[] {
    if (isCommandState(this._state)) {
      return this._state.commands().concat(this._commands);
    }
    return this._commands;
  }
}

export function isCommandState(obj: unknown): obj is CommandState<any> {
  return obj instanceof CommandState;
}

export function Command(state: unknown, command: CommandType) {
  return new CommandState(state, [command]);
}

export function BatchCommand(state: unknown, commands: CommandType[]) {
  return new CommandState(state, commands);
}
