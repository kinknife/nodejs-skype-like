const React = require('react');
const className = require('classnames');

import SideBar from './SideBar.jsx';
import ChatPage from './ChatPage.jsx';
const EditInfo = require('./EditInfo.jsx');
const StartPage = require('./StartPage.jsx');

import {connect} from 'react-redux';
import {name, atomicAction} from 'redux-atomic-action';

import {connections} from '../services/connections';
import {httpRequest} from '../services/httpRequest';
const utils = require('../services/utils');

class App extends React.Component {

    componentWillReceiveProps(nextProps) {
        if(nextProps.mapping) {
            connections.sendMapping(this.props.user._id);
        }
    }

    componentDidMount() {
        connections.updateChatCb(this.updateChat.bind(this));
        let token = utils.getCookie('token');
        if(token) {
            httpRequest.postHTTP({token: token}, 'token').then(res => {
                if(res.succeed) {
                    connections.sendMapping(res.user._id);
                    utils.setCookie('token', res.token, 1);
                    this.props.dispatch(name(utils.assignFunc({
                        user: res.user, 
                        page: 'StartPage'
                    })));
                } else {
                    utils.eraseCookie('token');
                    this.props.history.push('/signin');
                }
            });
        } else {
            this.props.history.push('/signin');
        }
    }

    getRightBlock() {
        let page = this.props.page;
        switch(page) {
            case 'StartPage':
                return <StartPage />;
            case 'ChatPage':
                return <ChatPage />;
            case 'EditInfo':
                return <EditInfo />;
            default:
                return null;
        }
    }

    updateChat(chats) {
        let user = Object.assign({}, this.props.user);
        for(let chat of chats) {
            let updateChat = user.chats.find(el => el.id === chat.id);
            if(updateChat) {
                if(chat.type === "update") {
                    for(let each of chats.messages) {
                        let updateMess = updateChat.find(el => el.timeCreate === each.timeCreate);
                        updateMess = each;
                    }
                } else if (chat.type === 'new') {
                    updateChat.messages.push(chat.messages);
                }
            } else {
                let seenIndex; 
                let lastChat = chat[chat.length - 1].timeCreate;
                if(chat[chat.length - 1].fromId === this.user.id) {
                    seenIndex = chat.length - 1;
                } else {
                    seenIndex = 0
                }
                let newChat = {
                    chatName: 'abc',
                    _id: chat.id,
                    seenIndex: seenIndex,
                    messages: chat.messages,
                    lastChat: lastChat
                }
                let user = Object.assign({}, this.props.user);
                user.chats.push(newChat);
                this.setState({
                    user: user
                });
            }
        }
        this.props.dispatch(name(utils.assignFunc({user: user})));
    }

    render() {
        return(
            <div className="app">
                {this.props.user ? 
                    <SideBar history={this.props.history}
                        httpRequest={httpRequest}
                        utils={utils}/> : null}
                {this.getRightBlock()}
            </div>
        );
    }
}

export default App = connect(state => state, null, null)(App);