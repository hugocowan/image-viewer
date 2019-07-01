import React from 'react';
import './App.scss';

class App extends React.Component {

  constructor(props) {
    super(props);
    this._app = null;

    this.state = {
      images: require.context('./assets', false, /\.(png|jpe?g|gif)$/).keys()
        .map(imageLink => imageLink.replace('./', ''))
    };

    
  }
  
  render() {

    console.log(this.state);

    const { images } = this.state,
      first = Math.ceil((images.length - 1) / 3), scnd = images.length - 1 - first;
  
    return (
      <div className="App" ref={c => this._app = c}>
        <div className='img-wrapper left'>
          {images.slice(0, first).map(imageLink => 
          <img prop={imageLink} alt={`From ${imageLink}`} key={imageLink} src={require(`./assets/${imageLink}`)} />
          )}
        </div>
        <div className='img-wrapper center'>
          {images.slice(first + 1, scnd).map(imageLink => 
          <img prop={imageLink} alt={`From ${imageLink}`} key={imageLink} src={require(`./assets/${imageLink}`)} />
          )}
        </div>
        <div className='img-wrapper right'>
          {images.slice(scnd + 1, images.length - 1).map(imageLink => 
          <img prop={imageLink} alt={`From ${imageLink}`} key={imageLink} src={require(`./assets/${imageLink}`)} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
