const React = require('react');
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
        connections.uploadFile(files, this.props.chatId);
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

module.exports = React.forwardRef((props, ref) => <DragDropOverlay {...props} childRef={ref} />);