import React from 'react';

class Modal extends React.Component {

    onDelete = () => {
        fetch('/api/delete', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: this.props.imageLink })
        });
    }

    render() {

        return (
            <div className={`modal`} onClick={() => this.props.onClick()}>
                {this.props.enableDelete && 
                <div className='button'>
                    <button onClick={this.onDelete}>Delete</button>
                </div>}
                <img
                    alt={`From ${this.props.imageLink}`}
                    src={require(`../assets/${this.props.imageLink}`)}
                />
            </div>

        );
    }
}

export default Modal;