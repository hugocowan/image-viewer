import React from 'react';
import './App.scss';

function App() {

  const images = require.context('./assets', false, /\.(png|jpe?g|gif)$/)
    .keys()
    .map(imageLink => imageLink.replace('./', ''));

  return (
    <div className="App">
        {images.map(imageLink => 
        <img prop={imageLink} alt={`From ${imageLink}`} key={imageLink} src={require(`./assets/${imageLink}`)} />
        )}
        <p>Hey</p>
    </div>
  );
}

export default App;
