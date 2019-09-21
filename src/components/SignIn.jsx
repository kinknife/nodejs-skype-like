const React = require('react');

const {connect} = require('react-redux');
const utils = require('../services/utils');
import { atomicAction, name } from 'redux-atomic-action';

import {httpRequest} from '../services/httpRequest';

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        // this.utils = props.utils;
        // this.connections = props.connections;
    }

    submit() {
        if(this.email.value === '' || !this.email.value) {
            return;
        }

        if(this.password.value === '' || !this.password.value) {
            return;
        }

        let user = {
            email: this.email.value,
            password: this.password.value
        };

        httpRequest.postHTTP(user, 'login').then(res => {
            if(res.succeed) {
                this.props.dispatch(name(utils.assignFunc({user: res.user, page: 'StartPage'}), 'MAPPING'));
                utils.setCookie('token', res.token, 1);
                this.props.history.push('/');
            }
        });
    }

    render() {
        return (
            <div className="log-container">
                <div className="logo"></div>
                <div className="title">Sign in to Vtalk</div>
                <div className="inputs-container">
                    <div className="input-container">
                        <div className="input-label">Email</div>
                        <div className="input">
                            <input placeholder="Enter your email" ref={(email) => { this.email = email }}></input>
                        </div>
                    </div>
                    <div className="input-container">
                        <div className="input-label">Password</div>
                        <div className="input">
                            <input placeholder="Enter your password" type="password" ref={(password) => { this.password = password }}></input>
                        </div>
                    </div>
                </div>
                <button className="action-btn" onClick={() => {this.submit()}}>Sign In</button>
                <div className="footer">
                    Don’t have an account? <a onClick={() => {this.props.history.push('/SignUp')}}>Sign Up</a>
                </div>
            </div>
        );
    }
}

SignIn = connect(state => state, null, null)(SignIn);
export default SignIn;