import { createStore, applyMiddleware } from 'redux';
import { createAtomicReducer, atomicThunk } from 'redux-atomic-action';
import { assign } from 'immu-func'

const initialState = {
	user: null,
	page: '',
	chatUser: ''
}

const defaultReducer = (state, action) => {
	const mapping = ['MAPPING'].indexOf(action.name) !== -1 ? true : false;
    return assign(state, {});
}

export const store = createStore(
	createAtomicReducer(initialState, defaultReducer),
	applyMiddleware(
		atomicThunk
	)
);