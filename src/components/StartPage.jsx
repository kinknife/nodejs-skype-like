const React = require('react');

const {connect} = require('react-redux');

class StartPage extends React.Component {

    render() {
        let nameArray = this.props.user.name.split(' ');
        let nameCharacter = nameArray[nameArray.length - 1][0];
        return(
            <div className="right-box start-page">
                <div className="title">Welcome, {this.props.user.name}</div>
                <div className="profile-pic">{nameCharacter}</div>
                <button className="action-btn">Start a conversation now!</button>
                <div className="sub-title">Search for someone to start or go to Contacts to see who is online</div>
            </div>
        );
    }
}

StartPage = connect(state => state, null, null)(StartPage);

module.exports = StartPage