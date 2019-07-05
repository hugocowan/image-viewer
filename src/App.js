import React from 'react';
import './App.scss';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import ImageRender from './components/ImageRender';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            images: require.context('./assets', false, /\.(png|jpe?g|gif)$/)
                        .keys()
                        .map(imageLink => imageLink.replace('./', '')),
            sortType: 'shuffle',
            updateNeeded: false,
            selectedImage: '',
        };

        this.state.images = this.shuffle(this.state.images);
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
    }

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
    }

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

    }

    debounce = (func, wait) => {
        
        let timeout;

        return function () {

            const _this = this, args = arguments, callNow = !timeout,
                later = function () {

                    timeout = null;
                    func.apply(_this, args);
                };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);

            if (callNow) func.apply(_this, args);
        }
    }

    render() {
        
        return (
            <div className="App">
                <Navbar 
                    handleSortChange={this.handleSortChange} 
                    sortType={this.state.sortType} 
                />
                {this.state.selectedImage && <Modal 
                    imageLink={this.state.selectedImage}
                    onClick ={() => this.setState({ selectedImage: '' })}
                />}
                <ImageRender 
                    images={this.state.images} 
                    handleSort={this.handleSort} 
                    handleSelectedImageChange={src => this.setState({ selectedImage: src })}
                    updateNeeded={this.state.updateNeeded}
                    updateDone={() => this.setState({ updateNeeded: false })}
                />
            </div>
        );
    }
}

export default App;
