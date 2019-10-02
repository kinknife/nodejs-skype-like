const React = require('react');
const { Player, ControlBar } = require('video-react');

class Messages extends React.Component {
    

    getMessages() {
        let messages = this.props.messages.map((el, index) => {
            let selfMessage = el.from === this.props.user._id;
            if(selfMessage) {
                return(
                    <div className='chat self' key={index}>{this.getMessageContent(el)}</div>
                );
            } else {
                return(
                    <div className='other-chat' key={index}>
                        <div className='profile-pic'></div>
                        <div className="chat other">{this.getMessageContent(el)}</div>
                    </div>
                )
            }
        });
        return messages;
    }

    getMessageContent(el) {
        this.uploading = {};
        if(el.type === 'text') {
            return el.content;
        }
        if(el.type === 'file') {
            let degree = (el.uploaded / el.content.size);
            return <div className="file-chat" onClick={() => {this.download(el.content.path)}}>
                {degree < 1 ? 
                <div className="progress-circle">
                    <svg className="progress-circle__svg" viewport="0 0 2000 2000">
                        <circle className="progress-circle__stroke" r="50%" cx="50%" cy="50%"></circle>
                        <circle className="progress-circle__stroke" r="50%" cx="50%" cy="50%" strokeDashoffset={`calc(314.1592% * ${degree})`}></circle>
                    </svg>
                </div> 
                : <div className="file-icon"></div>}
                <div className="file-info">
                    <div className="file-name">{el.content.fileName}</div>
                    <div className="file-size">{this.getFileSize(el.content.size)}</div>
                </div>
            </div>
        }
        if(el.type === 'image') {
            if(!el.content.path) {
                let fileReader = new FileReader();
                let degree = (el.uploaded / el.content.size);
                fileReader.onload = (e) => {
                    this.uploading[el.content.fileName].src = e.target.result;
                }

                fileReader.readAsDataURL(el.file);

                return <div className="media-container">
                    <div className="progress-circle">
                        <svg className="progress-circle__svg" viewport="0 0 2000 2000">
                            <circle className="progress-circle__stroke" r="50%" cx="50%" cy="50%"></circle>
                            <circle className="progress-circle__stroke" r="50%" cx="50%" cy="50%" strokeDashoffset={`calc(314.1592% * ${degree})`}></circle>
                        </svg>
                    </div>
                    <div className="stop-upload">&times;</div>
                    <img ref={(uploading) => {this.uploading[el.content.fileName] = uploading}}/>
                </div>
            } else {
                let server = DEVELOPMENT ? 'http://localhost:4200/' : '/';
                return <img src={`${server}image/${el.content.path}`} onClick={() => {this.zoomImg(`${server}image/${el.content.path}`)}}/>
            }
        }

        if(el.type === 'video') {
            if(!el.content.path) {
                let degree = (el.uploaded / el.content.size);
                return <div className="media-container">
                    <div className="progress-circle">
                        <svg className="progress-circle__svg" viewport="0 0 2000 2000">
                            <circle className="progress-circle__stroke" r="50%" cx="50%" cy="50%"></circle>
                            <circle className="progress-circle__stroke" r="50%" cx="50%" cy="50%" strokeDashoffset={`calc(314.1592% * ${degree})`}></circle>
                        </svg>
                    </div>
                    <div className="stop-upload">&times;</div>
                    <Player url={URL.createObjectURL(el.file)+'#t=0.5'}/>
                </div>
            } else {
                let server = DEVELOPMENT ? 'http://localhost:4200/' : '/';
                return <Player preload="metadata" fluid={false} width={360} heigh='auto' z-index={-10}>
                    <source src={`${server}image/${el.content.path}#t=0.5`}></source>
                    <ControlBar autoHide={false} />
                </Player>
            }
        }
    }

    getFileSize(size, useBad) {
        const SIUnits = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const BadUnits = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

        if (typeof size !== 'number') {
            throw 'Refusing to stringify something other than a number';
        }
        const step = useBad ? 1024 : 1000;
        const units = useBad ? BadUnits : SIUnits;
        const sign = size >= 0 ? '' : '-';
        const pow = Math.floor(Math.log(Math.max(size, 1)) / Math.log(step));

        size = Math.abs(size);

        size = size / Math.pow(step, pow);

        if (pow > 0) {
            size = size.toFixed(4).substring(0, 5);
        } else {
            size = size.toFixed(0);
        }

        return sign + size + ' ' + units[pow];
    }

    download(path) {
        let server = DEVELOPMENT ? 'http://localhost:4200/' : '/';
        window.open(`${server}download/${path}`, '_self');
    }

    zoomImg(src) {
        this.zoomedImg.src = src;
        this.zoomedImg.onload = () => {
            this.overlay.classList.remove('hidden');
        };
    }

    closeOverlay() {
        this.overlay.classList.add('hidden');
    }

    render() {
        return (
            <>
                <div className="messages">
                    {this.getMessages()}
                </div>
                <div className="img-overlay hidden" ref={(overlay) => {this.overlay = overlay}} onClick={() => {this.closeOverlay()}}>
                    <div className="close-btn" onClick={() => {this.closeOverlay()}}>&times;</div>
                    <img ref={(zoomedImg) => {this.zoomedImg = zoomedImg}} onClick={(e) => {e.stopPropagation()}}/>
                </div>
            </>
        );
    }
}

module.exports = Messages;