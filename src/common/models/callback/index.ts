export type BindingAction = () => void;
export type BindingCbWithOne<T> = (arg: T) => void;
export type BindingCbWithTwo<T1, T2> = (arg1: T1, arg2: T2) => void;
export type BindingCbWithThree<T1, T2, T3> = (arg1: T1, arg2: T2, arg3: T3) => void;
export type BindingCbWithFour<T1, T2, T3, T4> = (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void;