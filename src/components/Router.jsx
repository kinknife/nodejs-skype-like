import React from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';

import App from './App.jsx';
import Signin from './SignIn.jsx';
const Signup = require('./Signup.jsx');

function routing() {
    return(
        <Router>
            <div className="router">
                <Route exact path='/' component={App}/>
                <Route path='/signin' render={(props) => <div className="logScreen"><Signin {...props}/></div>}/>
                <Route path="/signup" render={(props) => <div className="logScreen"><Signup {...props}/></div>}/>
            </div>
        </Router>
    );
}

export default routing;