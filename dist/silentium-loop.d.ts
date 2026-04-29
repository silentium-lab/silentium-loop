type CommandNextType = (state: any, ...rest: any[]) => any;
type CommandFailType = (state: any, reason: any) => any;
type CommandType = {
    type: string;
    args?: any[];
    next?: CommandNextType;
    fail?: CommandNextType;
};
type CommandsType = (CommandType | CommandType[])[];
type StateWithCommands = {
    commands: CommandsType;
};
type CommandSetter<T> = (state: T, command: CommandType) => T;
declare function createCommand<T>(commandPush?: CommandSetter<T>): {
    Command(state: T, command: CommandType): T;
    BatchCommand(state: T, commands: CommandType[]): T;
};

type DispatchType = (fn: (...args: any[]) => any) => any;
type StoreActionType = (command: CommandType, dispatch: DispatchType) => Promise<any>;
type StoreActionProvider = [string, StoreActionType];
declare function Action(dispatch: DispatchType, actionsConfig: StoreActionProvider[], getCommands: () => CommandType[], resetCommands?: (state: any) => unknown, warning?: (...data: any[]) => void): () => Promise<void>;

export { Action, createCommand };
export type { CommandFailType, CommandNextType, CommandSetter, CommandType, CommandsType, DispatchType, StateWithCommands, StoreActionProvider, StoreActionType };
