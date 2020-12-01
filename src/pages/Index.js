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
            fixNavbar: false,
            username: this.props.username,
            sorting: 'shuffle',
            showSettings: false,
            sideMargin: 5,
            context: null,
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

        fetch(`${this.state.apiURL}:${this.state.apiPORT}/api/settings/get`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: this.state.username }),
        })
            .then(res => res.json())
            .then(({ showSettings, context, sorting, columnNumber, fixNavbar, sideMargin }) => {
                const columns = [];
                for (let i = 0; i < columnNumber; i++) columns.push([]);
                this.setState({ showSettings, context, sorting, columns, fixNavbar, sideMargin });

                fetch(`${this.state.apiURL}:${this.state.apiPORT}/api/images`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                })
                    .then(res => res.json())
                    .then(data => this.setState({ images: shuffle(data.files) }))
                    .catch(err => this.setState({ error: err.message }));
            })
            .catch(err => this.setState({ error: err.message }));
    }

    handleSortChange = sorting => {

        let images = [ ...this.state.images ];

        switch(sorting) {
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

        this.setState({ sorting, images, updateNeeded: (images.length > 0) ? true : false }, () => this.onSettingsChange());

    };

    handleColumnChange = ({ target: { value } }) => {
        const columns = [];
        for (let i = 0; i < value; i++) columns.push([]);
        this.setState({ columns, updateNeeded: this.state.images.length > 0 ? true : false }, () => this.onSettingsChange());
    };

    onSettingsChange = () => {
        const { apiURL, apiPORT, showSettings, context, sorting, columns, fixNavbar, username, sideMargin } = this.state;
        fetch(`${apiURL}:${apiPORT}/api/settings/set`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ showSettings, context, sorting, columns: columns.length, fixNavbar, username, sideMargin: (sideMargin === '' || sideMargin > 255) ? 5 : sideMargin })
        })
            .catch(err => this.setState({ error: err.message }));
    }

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
                    sorting={this.state.sorting}
                    toggleDelete={this.toggleDelete}
                    enableDelete={this.state.enableDelete}
                    imagesForDeletion={this.state.imagesForDeletion}
                    images={this.state.images}
                    columns={this.state.columns}
                    fixNavbar={this.state.fixNavbar}
                    showSettings={this.state.showSettings}
                    context={this.state.context}
                    sideMargin={this.state.sideMargin}
                    toggleMakeFixed={() => this.setState({ fixNavbar: !this.state.fixNavbar }, () => this.onSettingsChange())}
                    toggleShowSettings={() => this.setState({ showSettings: this.state.context ? true : !this.state.showSettings, context: (!this.state.showSettings) ? this.state.context : null }, () => this.onSettingsChange())}
                    handleNavContextChange={context => this.setState({ context }, () => this.onSettingsChange())}
                    handleSideMarginChange={event => this.setState({ sideMargin: parseInt(event.target.value) }, () => this.onSettingsChange())}
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
                    fixNavbar={this.state.fixNavbar}
                    apiURL={this.state.apiURL}
                    apiPORT={this.state.apiPORT}
                    images={this.state.images}
                    columns={this.state.columns}
                    sideMargin={this.state.sideMargin}
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
