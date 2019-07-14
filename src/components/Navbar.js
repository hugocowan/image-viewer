import React from 'react';

class Navbar extends React.Component {
    
    constructor (props) {
        super(props);

        this.state = {
            showNav: false,
            context: null
        };
    }

    renderBurger = () => {
        return <div 
            className={`burger ${this.state.showNav} context-${!!this.state.context}`} 
            onClick={() => this.state.context ? this.setState({ context: null }) :
                this.setState({ showNav: !this.state.showNav })}
            >
            <div />
            <div />
            <div />
        </div>
    };

    uploadImage = ({ target: { files } }) => {

        let imageForm = new FormData();

        for (let i = 0; i < files.length; i++) imageForm.append('imageData', files[i]);

        fetch(`${this.props.apiURL}:5001/api/upload`, {
            method: 'POST',
            body: imageForm,
        })
            .then(res => res.json())
            .then(res => {
                setTimeout(() => {
                    const images = this.props.images;
                    for (let i = 0; i < files.length; i++) images.push(files[i].name);
                    this.props.onImageChange(images);
                }, 200 * files.length);
            })
            .catch(err => console.log('error:', err));
    };

    render() {

        const { handleSortChange, sortType, enableDelete, toggleDelete } = this.props;

        return (
            <nav>
                <this.renderBurger />
                {this.state.showNav &&
                    <ul>

                        {this.state.context === null &&
                        <div>
                            <li
                                onClick={() => this.setState({ context: 'sorting' })}
                            >
                                Sorting
                            </li>
                            <li
                                onClick={() => this.setState({ context: 'files' })}
                            >
                                Files
                            </li>
                        </div>}
                        
                        {this.state.context === 'sorting' &&
                        <div>
                            <li 
                            className={`${sortType === 'shuffle'}`} 
                            onClick={() => handleSortChange('shuffle')}
                        >
                            Shuffle
                        </li>
                        <li 
                            className={`${sortType === 'natural'}`} 
                            onClick={() => handleSortChange('natural')}
                        >
                            Natural
                        </li>
                        <li 
                            className={`${sortType === 'naturalReverse'}`} 
                            onClick={() => handleSortChange('naturalReverse')}
                        >
                            Natural Reverse
                        </li>
                        </div>
                        } 
                        
                        {this.state.context === 'files' &&
                        <div>
                            <li>
                                <label htmlFor="file-upload" className="custom-file-upload">Upload</label>
                                <input 
                                    id="file-upload" 
                                    type='file'
                                    name="imageData"
                                    multiple
                                    accept=".png, .jpg, .gif, .jpeg"
                                    onChange={this.uploadImage} 
                                />
                            </li>
                            <li 
                                className={`${enableDelete}`} 
                                onClick={toggleDelete}
                            >
                                {!enableDelete && 'Enable Deleting'}
                                {enableDelete && 'Disable Deleting'}
                            </li>
                        </div>}
                    </ul>}
            </nav>
        );
    }
}

export default Navbar;