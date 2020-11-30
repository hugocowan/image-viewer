import React from 'react';

class Navbar extends React.Component {

    // constructor (props) {
    //     super(props);
    // }

    renderBurger = () => {
        return <div
                className={`burger ${this.props.showNav} context-${!!this.props.navContext}`}
                onClick={() => this.props.toggleShowNav()}
            >
            <div />
            <div />
            <div />
        </div>
    };

    uploadImage = ({ target }) => {

        let imageForm = new FormData();

        for (let i = 0; i < target.files.length; i++) imageForm.append('imageData', target.files[i]);

        fetch(`${this.props.apiURL}:5001/api/upload`, {
            method: 'POST',
            body: imageForm,
        })
            .then(res => res.json())
            .then(({ files = [] }) => {
                setTimeout(() => {
                    const images = this.props.images;
                    files.forEach(file => images.push(file.originalname)); 
                    this.props.onImageChange(images);
                    target.value = '';
                }, 200 * target.files.length);
            })
            .catch(err => console.log('error:', err));

    };

    handleDelete = () => {

        fetch(`${this.props.apiURL}:5001/api/delete`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filenames: this.props.imagesForDeletion })
        })
            .then(res => console.log(res.json()))
            .catch(err => console.log('Error deleting:', err));

        const images = this.props.images;
        this.props.imagesForDeletion.forEach(img => images.splice(images.indexOf(img), 1));
        this.props.onImageChange(images);
        this.props.toggleDelete();
    };

    render() {

        const {
            handleSortChange, handleColumnChange, handleNavContextChange,
            sortType,
            enableDelete, toggleDelete,
            imagesForDeletion, columns,
            makeFixed, toggleMakeFixed
        } = this.props;

        const columnSizes = [];

        for (let i = 1; i <= 100; i++) {
            columnSizes.push(i);
        }

        return (
            <nav className={`${makeFixed || enableDelete}`}>
                <this.renderBurger />
                {this.props.showNav &&
                    <ul>

                        {this.props.navContext === null &&
                        <div>
                            <li
                                onClick={() => handleNavContextChange('sorting')}
                            >
                                Sorting
                            </li>
                            <li
                                onClick={() => handleNavContextChange('files')}
                            >
                                Files
                            </li>
                            <li
                                
                            >
                                <label htmlFor='column-sizes'>Columns</label>
                                <select id='column-sizes' value={columns.length} onChange={handleColumnChange}>
                                    {columnSizes.map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </li>
                            <li
                                className={`${makeFixed}`}
                                onClick={toggleMakeFixed}
                            >
                                Fix Navbar
                            </li>
                        </div>}

                        {this.props.navContext === 'sorting' &&
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

                        {this.props.navContext === 'files' &&
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
                            {enableDelete &&
                            <li
                                className={'delete'}
                                onClick={this.handleDelete}
                            >
                                Delete {imagesForDeletion.length} images
                            </li>}
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
