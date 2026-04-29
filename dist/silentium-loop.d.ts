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
declare class CommandState<T> {
    private _state;
    private _commands;
    constructor(_state: T | CommandState<T>, _commands: CommandType[]);
    state(): CommandState<T> | T;
    commands(): CommandType[];
}
declare function isCommandState(obj: unknown): obj is CommandState<any>;
declare function Command(state: unknown, command: CommandType): CommandState<unknown>;
declare function BatchCommand(state: unknown, commands: CommandType[]): CommandState<unknown>;

type DispatchType = (fn: (...args: any[]) => any) => any;
type StoreActionType = (command: CommandType, dispatch: DispatchType) => Promise<any>;
type StoreActionProvider = [string, StoreActionType];
declare function Action(nativeDispatch: DispatchType, actionsConfig: StoreActionProvider[], warning?: (...data: any[]) => void): (fn: (...args: any[]) => any) => Promise<unknown>;

export { Action, BatchCommand, Command, CommandState, isCommandState };
export type { CommandFailType, CommandNextType, CommandSetter, CommandType, CommandsType, DispatchType, StateWithCommands, StoreActionProvider, StoreActionType };
