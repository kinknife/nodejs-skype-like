const React = require('react');
const classNames = require('classnames');

const {connect} = require('react-redux');
const utils = require('../services/utils');
const {name, atomicAction} = require('redux-atomic-action');

class SideBarContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeCard: null
        }
    }
    
    getItems() {
        let self = this
        let chats = this.props.items.map((el, index) => {
            let user = el;
            let lastMessage = '';
            if(this.props.type === 'Chats') {
                user = this.props.user.friends.find(friend => friend._id.toString() === el.chatRef);
                if(!user) {
                    user = this.props.user.pendings.find(pendings =>  pendings._id.toString() === el.chatRef);
                }
                lastMessage = el.messages[el.messages.length - 1].content;
            }
            let nameArray = user.name.split(' ');
            let nameCharacter = nameArray[nameArray.length - 1][0];
            let cardClass = classNames({
                "chat-card": true,
                active: index === self.state.activeCard
            });
            return(
                <div key={index} className={cardClass} onClick={() => {this.selectCard(index, user)}}>
                    <div className="profile-pic">{nameCharacter}</div>
                    <div className="chat-info">
                        <div className="name">{user.name}</div>
                        <div className="lastMessage">{lastMessage}</div>
                    </div>
                </div>
            );
        });
        return chats;
    }

    selectCard(index, user) {
        this.setState({
            activeCard: index
        });
        this.props.dispatch(name(utils.assignFunc({
            chatUser: user,
            page: 'ChatPage'
        })));
    }

    render() {
        return(
            <div className="content-container">
                {this.getItems()}
            </div>
        );
    }
}

SideBarContent = connect(state => state, null, null)(SideBarContent);

module.exports = SideBarContent;