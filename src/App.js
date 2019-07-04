import React from 'react';
import ImageRender from './components/ImageRender';
import './App.scss';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            images: require.context('./assets', false, /\.(png|jpe?g|gif)$/)
                        .keys()
                        .map(imageLink => imageLink.replace('./', '')),
            imageLimit: 1000,
            imagesMax: null,
            isLoading: true,
        };

        this.state.imagesMax = this.state.images.length;
        this.state.images = this.shuffle(this.state.images);
    }

    componentDidMount() {
        
        window.onscroll = this.debounce(() => {
            
            const { isLoading, imageLimit, imagesMax } = this.state;
            
            if (isLoading || imageLimit >= imagesMax) return;
            
            if (window.innerHeight + window.pageYOffset === 
                document.documentElement.offsetHeight)
            {
                this.setState({ isLoading: true, imageLimit: imageLimit + 1000 });
            }
            
        }, 500);
    }

    componentDidUpdate() {

        if (this.state.imageLimit >= this.state.imagesMax) {
            window.onscroll = null;
        }
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

    setIsLoading = (bool) => {
        this.setState({ isLoading: bool });
    }

    render() {
        
        return (
            <div className="App">
                <ImageRender 
                    images = {this.state.images.slice(0, this.state.imageLimit)}
                    setIsLoading = {this.setIsLoading}
                    isLoading = {this.state.isLoading}
                />
                {/* {this.state.isLoading && <div>
                    Loading...
                </div>} */}
            </div>
        );
    }
}

export default App;
