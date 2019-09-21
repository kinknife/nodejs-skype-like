const React = require('react');

const {connect} = require('react-redux');
import {connections} from '../services/connections';
const {name} = require('redux-atomic-action');
const utils = require('../services/utils');
const cx = require('classnames');

class ChatPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            chat: {},
            chatUser: {}
        };

    }

    componentWillMount() {
        let chatUser = this.props.chatUser || this.props.user.pending.find(el => el._id === chatUser.chatRef);
        let chat = this.props.user.chats.find(el => {return el._id = chatUser._id});
        this.setState({
            chat: chat,
            chatUser: chatUser
        });
    }

    submitMsg(e) {
        this.addEndBr();
        let characterCode = e.keyCode;
        if(e.ctrlKey && characterCode === 13) {
            this.messInput.innerHTML += '<br/>';
            this.setCaretEnd();
            return;
        }

        if(characterCode === 13) {
            e.preventDefault();
            if(!this.state.chat) {
                connections.sendFriendRequest(this.props.user._id, this.props.chatUser._id, this.messInput.innerText.trim(), this.props.chatUser.name, 'text');
            } else {
                let newMess = {
                    from: this.props.user._id,
                    to: this.state.chatUser._id,
                    content:  this.messInput.innerText.trim(),
                    type: 'text',
                    timeCreate: new Date(),
                    status: 'sending',
                    seen: []
                };
                let chat = this.state.chat;
                chat.messages.push(newMess);
                this.setState({
                    chat: chat
                });
                this.messInput.innerText = '';
                connections.sendChat(this.state.chat.id, newMess);
            }
        }
    }

    addEndBr() {
        if(this.messInput.innerHTML === '<br>' ) {
            this.messInput.innerHTML = '';
            return;
        }
        let stringLen = this.messInput.innerHTML.length
        let endStr = this.messInput.innerHTML.substr(stringLen - 4, 4);
        if(endStr === '<br>') {
            return;
        }
        this.messInput.innerHTML += '<br>';
        this.setCaretEnd();
    }

    setCaretEnd() {
        let range = document.createRange();
        let sel = window.getSelection();
        range.setStart(this.messInput, this.messInput.innerText.length - 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    acceptRequest() {
        let user = Object.assign({}, this.props.user);
        let addedId = this.state.chatUser._id;
        let pendingIndex = user.pendings.findIndex(el => el._id === addedId);
        let addedUser = user.pendings[pendingIndex];
        user.pendings.splice(pendingIndex, 1);
        user.friends.push(addedUser);
        this.props.dispatch(name(utils.assignFunc({user: user})));
        connections.acceptRequest(user._id, this.state.chatUser._id);
    }

    getChats() {
        let chatUser = this.state.chatUser;
        let chat = this.state.chat;
        let isFriend = this.props.user.friends.some((el) => el._id === chatUser._id);
        let isSender = this.state.chat.messages[0].from === this.props.user._id;
        if(chat && isFriend) {
            return(
                <div></div>
            );
        } else {
            if(isSender) {
                let nameArray = chatUser.name.split(' ');
                let nameCharacter = nameArray[nameArray.length - 1][0];
                let addBtnClass = cx({
                    'action-btn': true,
                    'add-contact': true,
                    disabled: !!chat
                });
                
                return(
                    <div className="new-contact">
                        <div className="user-info">
                            <div className="profile-pic">{nameCharacter}</div>
                            <div className="detail">
                                <div className="user-name">{chatUser.name}</div>
                                <div className="email">{chatUser.email}</div>
                                <div className="mutual-friend">2 mutual friend</div>
                            </div>
                        </div>
                        <div className={addBtnClass}>{!chat ? 'Add to Contacts' : `Waiting for ${nameArray[nameArray.length - 1]} to accept invitation`}</div>
                    </div>
                );
            } else {
                return(
                    <div className="invitation">
                        <div className="invitation-title"><b>{chatUser.name}</b> would like to add you</div>
                        <div className="bottom-control">
                            <div className='action-btn' onClick={() => {this.acceptRequest()}}>Accept</div>
                            <div className='action-btn'>Decline</div>
                        </div>
                    </div>
                );
            }
        }
    }

    getMessBtnControl() {
        if(!this.messInput || !this.messInput.value || this.messInput.value === '') {
            return(<button className="send-btn"></button>);
        } else {
            return null;
        }
    }

    getMessages() {
        let messages = this.state.chat.messages.map(el => {
            let selfMessage = el.from === this.props.user._id;
            if(selfMessage) {
                return(
                    <div className='chat self'>{el.content}</div>
                );
            } else {
                return(
                    <div className='other-chat'>
                        <div className='profile-pic'></div>
                        <div className="chat other">{el.content}</div>
                    </div>
                )
            }
        });
        return messages;
    }

    render() {
        let isFriend = this.props.user.friends.some((el) => el._id === this.state.chatUser._id);
        return(
            <div className="right-box chat-page">
                <div className="top-bar">
                    <div className="left-column">
                        <div className="name">{this.props.chatUser.name}</div>
                        {isFriend ? 
                            <div className="bottom-control">
                                <div className="status">{this.props.chatUser.status}</div>
                                <div className="sep"></div>
                                <div className="search-icon">Search in conversation</div>
                            </div>
                            : null}
                    </div>
                    <div className="right-column">
                        <button className="chat-ctl-btn voice-chat"></button>
                        <button className="chat-ctl-btn video-chat"></button>
                        <button className="chat-ctl-btn add-to-group"></button>
                    </div>
                </div>
                <div className="chat-box">
                    {this.getChats()}
                    <div className="messages">
                        {this.getMessages()}
                    </div>
                    <div className="input" ref={(inputContainer) => {this.inputContainer = inputContainer}}>
                        <div placeholder="Type your message here" ref={(messInput) => {this.messInput = messInput}} onChange={(e) => {this.autoResize(e)}} contentEditable="true" onKeyDown={(e) => {this.submitMsg(e)}}></div>
                        {this.getMessBtnControl()}
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatPage = connect(state => state, null, null)(ChatPage);