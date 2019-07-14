import React from 'react';

class Modal extends React.Component {

    render() {

        return (
            <div className={`modal`} onClick={() => this.props.onClick()}>
                <img
                    alt={`From ${this.props.imageLink}`}
                    src={`${this.props.apiURL}:5001/media/${this.props.imageLink}`}
                />
            </div>

        );
    }
}

export default Modal;