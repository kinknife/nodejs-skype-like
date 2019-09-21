const React = require('react');
const SideBarContent = require('./SideBarContent.jsx');

import {connect} from 'react-redux';
import {name, atomicAction} from 'redux-atomic-action';

class SideBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            type: 'Chats'
        };

        this.utils = props.utils;
        this.httpRequest = props.httpRequest;
    }

    componentDidMount() {
        this.setState({
            items: this.props.user.chats,
            type: 'Chats'
        });
    }

    logout() {
        let token = this.utils.getCookie('token');

        this.httpRequest.postHTTP({token: token}, 'revoke').then(res => {
            if(res.succeed) {
                this.utils.eraseCookie('token');
                this.props.history.push('/signin');
            }
        })
    }

    handleSearchChange() {
        clearTimeout(this.searchTimeOut);
        if(this.search.value === '') {
            this.setState({
                items: []
            });
        }
        if(this.search.value) {
            this.searchTimeOut = setTimeout(() => {
                this.httpRequest.postHTTP({
                    email: this.search.value
                }, 'suggest').then(res => {
                    this.setState({
                        items: res.users.filter(el => {return el._id !== this.props.user._id})
                    });
                });
            }, 500);
        }
    }

    changeTab(tab) {
        if(tab === 'Chats') {
            this.setState({
                items: this.props.user.chats,
                type: 'Chats'
            });
        } else {
            this.setState({
                items: this.props.user.friends,
                type: 'Friends'
            });
        }
    }

    render() {
        let nameArray = this.props.user.name.split(' ');
        let nameCharacter = nameArray[nameArray.length - 1][0];
        return(
            <div className="side-bar">
                <div className="user-section">
                    <div className="profile-pic">{nameCharacter}</div>
                    <div className="name">{this.props.user.name}</div>
                    <div className="logout" onClick={() => {this.logout()}}></div>
                </div>
                <div className="input search">
                    <div className="search-icon icons"></div>
                    <input placeholder="people, groups and messages" ref={(search) => {this.search = search}} onChange={() => {this.handleSearchChange()}}></input>
                </div>
                <div className="tab-header">
                    <div className="tab" onClick={() => {this.changeTab('Chats')}}>
                        <div className="chats icons"></div>
                        <div className="tab-title">Chats</div>
                    </div>
                    <div className="tab" onClick={() => {this.changeTab('Contacts')}}>
                        <div className="contacts icons"></div>
                        <div className="tab-title">Contacts</div>
                    </div>
                    <div className="tab" onClick={() => {this.props.dispatch(name(this.utils.assignFunc({page: 'EditInfo'})))}}>
                        <div className="info-icon icons"></div>
                        <div className="tab-title">Edit Info</div>
                    </div>
                </div>
                <div className="tab-content">
                    <div className="tab-title">Recent Chat</div>
                    <SideBarContent items={this.state.items} type={this.state.type}/>
                </div>
            </div>
        )
    }
}

export default SideBar = connect(state => state, null, null)(SideBar);