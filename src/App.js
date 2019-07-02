import React from 'react';
import ImageRender from './components/ImageRender';
import './App.scss';

function App() {

    const images = require.context('./assets', false, /\.(png|jpe?g|gif)$/).keys()
        .map(imageLink => imageLink.replace('./', ''));

    return (
        <div className="App">
            <ImageRender images = {images}/>
        </div>
    );
}

export default App;
