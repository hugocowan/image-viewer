import React from 'react';
import ImageRender from './components/ImageRender';
import './App.scss';

function App() {

    const images = require.context('./assets', false, /\.(png|jpe?g|gif)$/).keys()
        .map(imageLink => imageLink.replace('./', ''))
        .sort((a, b) => {

            const ax = [], bx = [];

            a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
            
            while(ax.length && bx.length) {
                var an = ax.shift();
                var bn = bx.shift();
                var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if(nn) return nn;
            }
        
            return ax.length - bx.length;
        });

    return (
        <div className="App">
            <ImageRender images = {images}/>
        </div>
    );
}

export default App;
