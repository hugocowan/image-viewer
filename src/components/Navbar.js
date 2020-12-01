import React from 'react';

class Navbar extends React.Component {

    // constructor (props) {
    //     super(props);
    // }

    renderBurger = () => {
        return <div
                className={`burger ${this.props.showSettings} context-${!!this.props.context}`}
                onClick={() => this.props.toggleShowSettings()}
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
            handleSortChange, handleNavContextChange,
            sorting, sideMargin,
            enableDelete, toggleDelete,
            imagesForDeletion, columns,
            fixNavbar, toggleMakeFixed
        } = this.props;

        const columnSizes = [];

        for (let i = 1; i <= 100; i++) {
            columnSizes.push(i);
        }

        return (
            <nav className={`${fixNavbar || enableDelete}`}>
                <this.renderBurger />
                {this.props.showSettings &&
                    <ul>

                        {this.props.context === null &&
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
                                onClick={() => handleNavContextChange('columns')}
                            >
                                Columns
                            </li>
                            <li
                                className={`${fixNavbar}`}
                                onClick={toggleMakeFixed}
                            >
                                Fix Navbar
                            </li>
                            <li
                                onClick={() => handleNavContextChange('account')}
                            >
                                Account
                            </li>
                        </div>}

                        {this.props.context === 'sorting' &&
                        <div>
                            <li
                            className={`${sorting === 'shuffle'}`}
                            onClick={() => handleSortChange('shuffle')}
                            >
                                Shuffle
                            </li>
                            <li
                                className={`${sorting === 'natural'}`}
                                onClick={() => handleSortChange('natural')}
                            >
                                Natural
                            </li>
                            <li
                                className={`${sorting === 'naturalReverse'}`}
                                onClick={() => handleSortChange('naturalReverse')}
                            >
                                Natural Reverse
                            </li>
                        </div>
                        }

                        {this.props.context === 'files' &&
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

                        {this.props.context === 'columns' &&
                        <div>
                            <li>
                                <label htmlFor='column-number'>Number</label>
                                <input 
                                    id="column-number"
                                    type="number"
                                    name="column-number"
                                    max="255"
                                    min="1"
                                    value={columns.length}
                                    onChange={this.props.handleColumnChange}
                                />
                            </li>
                            <li>
                                <label htmlFor='side-margin'>Margin</label>
                                <input 
                                    id="side-margin"
                                    type="number"
                                    name="side-margin"
                                    max="255"
                                    min="0"
                                    value={sideMargin}
                                    onChange={this.props.handleSideMarginChange}
                                />
                            </li>
                            
                        </div>}

                        {this.props.context === 'account' &&
                        <div>
                            <li>
                                {this.props.username}
                            </li>
                            <li onClick={() => this.props.handleLogOut()}>
                                Log Out
                            </li>
                            
                        </div>}

                    </ul>}
            </nav>
        );
    }
}

export default Navbar;
