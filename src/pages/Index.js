import React, { Suspense } from 'react';
import { shuffle, naturalSort } from '../lib/Sort';
import '../style/App.scss';
const Modal = React.lazy(() => import('../components/Modal'));
const Navbar = React.lazy(() => import('../components/Navbar'));
const ImageRender = React.lazy(() => import('../components/ImageRender'));

class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            images: null,
            makeFixed: false,
            sortType: 'shuffle',
            columns: [ [], [], [] ],
            updateNeeded: false,
            error: false,
            selectedImage: '',
            enableDelete: false,
            imagesForDeletion: [],
            apiURL: process.env.REACT_APP_API_URL,
            apiPORT: process.env.REACT_APP_API_PORT,
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

    handleColumnChange = ({ target: { value } }) => {
        const columns = [];
        for (let i = 0; i < value; i++) columns.push([]);

        this.setState({ columns, updateNeeded: true });
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
            <Suspense>
                <Navbar
                    apiURL={this.state.apiURL}
                    apiPORT={this.state.apiPORT}
                    handleSortChange={this.handleSortChange}
                    handleColumnChange={this.handleColumnChange}
                    sortType={this.state.sortType}
                    toggleDelete={this.toggleDelete}
                    enableDelete={this.state.enableDelete}
                    imagesForDeletion={this.state.imagesForDeletion}
                    images={this.state.images}
                    columns={this.state.columns}
                    makeFixed={this.state.makeFixed}
                    toggleMakeFixed={() => this.setState({ makeFixed: !this.state.makeFixed })}
                    onImageChange={images => this.onImageChange(images)}
                />
                {this.state.selectedImage &&
                <Modal
                    apiURL={this.state.apiURL}
                    apiPORT={this.state.apiPORT}
                    images={this.state.images}
                    imageLink={this.state.selectedImage}
                    enableDelete={this.state.enableDelete}
                    onImageChange={images => this.onImageChange(images)}
                    onClick ={() => this.setState({ selectedImage: '' })}
                />}
                <ImageRender
                    makeFixed={this.state.makeFixed}
                    apiURL={this.state.apiURL}
                    apiPORT={this.state.apiPORT}
                    images={this.state.images}
                    columns={this.state.columns}
                    handleSelectedImage={src => this.handleSelectedImage(src)}
                    imagesForDeletion={this.state.imagesForDeletion}
                    updateNeeded={this.state.updateNeeded}
                    updateDone={() => this.setState({ updateNeeded: false })}
                />
            </Suspense>
        </div>;
    }
}

export default Index;
