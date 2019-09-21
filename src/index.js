const React = require('react');
const ReactDom = require('react-dom');

import { Provider } from 'react-redux';
import './styles/index.styl';
import Router from './components/Router.jsx';
import {store} from './store.js';

ReactDom.render(<Provider store={store}><Router /></Provider>, document.getElementById('root'));