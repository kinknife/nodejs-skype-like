const React = require('react');
const {connect} = require('react-redux');
const {connections} = require('../services/connections');

class DragDropOverlay extends React.Component {

    componentDidMount() {
        if(this.props.childRef){
            this.props.childRef.current.addEventListener('dragover', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
            this.props.childRef.current.addEventListener('drop', (e) => {
                this.handleDropFile(e);
            });
        }
    }

    handleDragLeave() {
        this.props.childRef.current.classList.add('hidden');
    }

    handleDropFile(e) {
        let files = e.target.files || e.dataTransfer.files;
        e.preventDefault();
        let toId = this.props.chat.chatRef;

        connections.uploadFile(files, this.props.chat.id, toId, this.props.user._id);
        this.props.childRef.current.classList.add('hidden');
    }

    render() {
        return (
            <div className="overlay hidden" ref={this.props.childRef} onDragLeave={() => {this.handleDragLeave()}}>
                <div className="files-upload-icon"></div>
                <div className="overlay-text">Drop files to send</div>
            </div>
        );
    }
}

DragDropOverlay = connect(state => state, null, null)(DragDropOverlay);
module.exports = React.forwardRef((props, ref) => <DragDropOverlay {...props} childRef={ref} />);