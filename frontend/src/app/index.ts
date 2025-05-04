import store from './store';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState, AppDispatch } from './store';

// Define the AppThunk type
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export { store };
export type { RootState, AppDispatch }; 