import React from 'react';
import '../App.scss';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import ImageRender from '../components/ImageRender';
import { shuffle, naturalSort } from '../lib/Sort';

class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            images: null,
            makeFixed: false,
            sortType: 'shuffle',
            updateNeeded: false,
            error: false,
            selectedImage: '',
            enableDelete: false,
            imagesForDeletion: [],
            apiURL: process.env.REACT_APP_API_URL
        };
    }

    componentDidMount() {

        if (this.state.apiURL === undefined) {
            this.setState({ error: 'API URL not set in .env - see README.' });
            return;
        }

        fetch(`${this.state.apiURL}:5001/api/images`, {
            headers: {
                'Accept': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => this.setState({ images: shuffle(data.files) }))
            .catch(err => this.setState({ error: err.message }));
    }

    handleSortChange = sortType => {

        let images = [ ...this.state.images ];

        switch(sortType) {
            case 'shuffle' :
                images = shuffle(images);
                break;

            case 'natural' :
                images.sort(naturalSort);
                break;

            case 'naturalReverse' :
                images.sort(naturalSort).reverse();
                break;

            default: break;
        }

        this.setState({ sortType, images, updateNeeded: true });

    };

    handleSelectedImage = src => {

        let filename = src;

        if (!this.state.enableDelete) {

            this.setState({ selectedImage: filename });
            return;
        }

        const delImgs = [ ...this.state.imagesForDeletion ];

        if (filename.slice(0, 4) === 'live-') filename = filename.substring(5);

        delImgs.includes(filename) ? delImgs.splice(delImgs.indexOf(filename), 1) : delImgs.push(filename);
        this.setState({ imagesForDeletion: delImgs });
    }

    onImageChange = images => this.setState({ images, updateNeeded: true });

    toggleDelete = () => this.state.enableDelete ?
        this.setState({ enableDelete: !this.state.enableDelete, imagesForDeletion: [] }) : 
        this.setState({ enableDelete: !this.state.enableDelete });

    render() {

        if (this.state.images === null) return (
            <div className={`App ${!!this.state.error}`}>
                {this.state.error || 'Loading...'}
            </div>
        );

        return <div className={`App ${!!this.state.enableDelete}`}>
            <Navbar
                apiURL={this.state.apiURL}
                handleSortChange={this.handleSortChange}
                sortType={this.state.sortType}
                toggleDelete={this.toggleDelete}
                enableDelete={this.state.enableDelete}
                imagesForDeletion={this.state.imagesForDeletion}
                images={this.state.images}
                makeFixed={this.state.makeFixed}
                toggleMakeFixed={() => this.setState({ makeFixed: !this.state.makeFixed })}
                onImageChange={images => this.onImageChange(images)}
            />
            {this.state.selectedImage &&
            <Modal
                apiURL={this.state.apiURL}
                images={this.state.images}
                imageLink={this.state.selectedImage}
                enableDelete={this.state.enableDelete}
                onImageChange={images => this.onImageChange(images)}
                onClick ={() => this.setState({ selectedImage: '' })}
            />}
            <ImageRender
                makeFixed={this.state.makeFixed}
                apiURL={this.state.apiURL}
                images={this.state.images}
                handleSelectedImage={src => this.handleSelectedImage(src)}
                imagesForDeletion={this.state.imagesForDeletion}
                updateNeeded={this.state.updateNeeded}
                updateDone={() => this.setState({ updateNeeded: false })}
            />
        </div>;
    }
}

export default Index;
