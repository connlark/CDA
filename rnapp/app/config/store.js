import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';


const sagaMiddleware = createSagaMiddleware();
const middleware = [thunk, sagaMiddleware];

/*if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
}*/

const store = createStore(reducer, composeWithDevTools(applyMiddleware(...middleware)));
//const store = createStore(reducer, applyMiddleware(...middleware));

const action = type => store.dispatch({type})

export default store;
