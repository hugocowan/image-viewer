import React from 'react';

class Modal extends React.Component {

    render() {

        // const [ imageLink ] = this.props;

        return (
            <div className={`modal`} onClick={() => this.props.onClick()}>
                <img
                    alt={`From ${this.props.imageLink}`}
                    src={require(`../assets/${this.props.imageLink}`)}
                />
            </div>

        );
    }
}

export default Modal;