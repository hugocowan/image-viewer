import React from 'react';
import './App.scss';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import ImageRender from './components/ImageRender';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            images: null,
            makeFixed: false,
            sortType: 'shuffle',
            updateNeeded: false,
            selectedImage: '',
            enableDelete: false,
            imagesForDeletion: [],
            apiURL: process.env.REACT_APP_API_URL
        };
    }

    componentDidMount() {
        fetch(`${this.state.apiURL}:5001/api/images`, {
            headers: {
                'Accept': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => this.setState({ images: this.shuffle(data.files) }))
            .catch(err => console.log('error:', err));
    }

    shuffle = (array) => {
        let currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    };

    naturalSort = (a, b) => {
                
        const ax = [], bx = [];

        a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
        b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
        
        while (ax.length && bx.length) {
            let an = ax.shift();
            let bn = bx.shift();
            let nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
            if(nn) return nn;
        }
    
        return ax.length - bx.length;
    };

    handleSortChange = (sortType) => {
    
        let images = [ ...this.state.images ];

        switch(sortType) {
            case 'shuffle' :
                images = this.shuffle(images);
                break;
            
            case 'natural' :
                images.sort(this.naturalSort);
                break;
            
            case 'naturalReverse' : 
                images.sort(this.naturalSort).reverse();
                break;

            default: break;
        }

        this.setState({ sortType, images, updateNeeded: true });

    };

    handleSelectedImage = src => {

        if (!this.state.enableDelete) {

            this.setState({ selectedImage: src });
            return;  
        }

        const delImgs = [ ...this.state.imagesForDeletion ];
        delImgs.includes(src) ? delImgs.splice(delImgs.indexOf(src), 1) : delImgs.push(src);
        this.setState({ imagesForDeletion: delImgs });
    }

    onImageChange = images => this.setState({ images, updateNeeded: true });

    toggleDelete = () => this.state.enableDelete ?
        this.setState({ enableDelete: !this.state.enableDelete, imagesForDeletion: [] }) 
        : this.setState({ enableDelete: !this.state.enableDelete });

    render() {

        if (this.state.images === null) return ( 
            <div className="App">
                Loading...
            </div>
        );
        
        return (
            <div className="App">
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
                    handleSort={this.handleSort} 
                    handleSelectedImage={src => this.handleSelectedImage(src)}
                    imagesForDeletion={this.state.imagesForDeletion}
                    updateNeeded={this.state.updateNeeded}
                    updateDone={() => this.setState({ updateNeeded: false })}
                />
            </div>
        );
    }
}

export default App;
