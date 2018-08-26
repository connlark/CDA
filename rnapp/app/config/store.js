import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';
import reducer from '../reducers';

const navMiddleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
);
const sagaMiddleware = createSagaMiddleware();
const middleware = [thunk, sagaMiddleware, navMiddleware];

if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);

}

const store = createStore(reducer, applyMiddleware(...middleware));

const action = type => store.dispatch({type})

export default store;
