import React from 'react';

class Modal extends React.Component {

    onDelete = () => {
        fetch(`${this.props.apiURL}:5001/api/delete`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: this.props.imageLink })
        });

        const images = this.props.images;
        images.splice(images.indexOf(this.props.imageLink), 1);
        this.props.onImageChange(images);
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
                    src={`${this.props.apiURL}:5001/media/${this.props.imageLink}`}
                />
            </div>

        );
    }
}

export default Modal;