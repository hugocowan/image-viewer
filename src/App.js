import React from 'react';
import ImageRender from './components/ImageRender';
import './App.scss';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            images: require.context('./assets', false, /\.(png|jpe?g|gif)$/).keys()
                .map(imageLink => imageLink.replace('./', ''))
        };
    }

    render() {

        const { images } = this.state;

        return (
            <div className="App">
                <ImageRender images = {images}/>
            </div>
        );
    }
}

export default App;
