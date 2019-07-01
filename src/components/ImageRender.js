import React from 'react';

class ImageRender extends React.Component {

    constructor(props) {
        super(props);

        const oneThird = Math.ceil((props.images.length - 1) / 3),
            twoThirds = props.images.length - 1 - oneThird;

        this.state = {
            splits: [ 0, oneThird, twoThirds, props.images.length - 1 ]
        };
    }
    

    onImgLoad = (col, index, end) => {

        if (col === 2 && index === end) {
            
            
            
            function getHeights(_this) {
                
                setTimeout(() => {
                    
                    let col0Height = _this.col0.clientHeight,
                        col1Height = _this.col1.clientHeight,
                        col2Height = _this.col2.clientHeight;

                    const avgHeight = (col0Height + col1Height + col2Height) / _this.props.images.length;

                    const splits = [..._this.state.splits];
                    
                    if (col0Height - col1Height > avgHeight) {

                        splits[1]--;
                        _this.setState({ splits }, () => {
                            col0Height = _this.col0.clientHeight;
                            col1Height = _this.col1.clientHeight;
                            if (col0Height - col1Height > avgHeight) getHeights(_this);
                        });
                    } else if (col0Height - col1Height < avgHeight) {

                        splits[1]++;
                        _this.setState({ splits }, () => {
                            col0Height = _this.col0.clientHeight;
                            col1Height = _this.col1.clientHeight;
                            if (col0Height - col1Height < avgHeight) getHeights(_this);
                        });
                    }

                    if (col1Height - col2Height > avgHeight) {

                        splits[2]--;
                        _this.setState({ splits }, () => {
                            col1Height = _this.col1.clientHeight;
                            col2Height = _this.col2.clientHeight;
                            if (col1Height - col2Height > avgHeight) getHeights(_this);
                        });
                    } else if (col1Height - col2Height < avgHeight) {
                        
                        splits[2]++;
                        _this.setState({ splits }, () => {
                            col1Height = _this.col1.clientHeight;
                            col2Height = _this.col2.clientHeight;
                            if (col1Height - col2Height < avgHeight) getHeights(_this);
                        });
                    }

                }, 100);
            }

            getHeights(this);
        }
    }

    render() {

        const { images } = this.props, 
            { splits } = this.state;

        return (
            <div className='img-container'>
                {[0, 1, 2].map(col => {

                    return <div key={col} className='img-wrapper' ref={c => this[`col${col}`] = c}>
                        {images.slice(splits[col], splits[col + 1]).map((imageLink, index, arr) =>
                            <img
                                key={imageLink}
                                alt={`From ${imageLink}`}
                                src={require(`../assets/${imageLink}`)}
                                onLoad={() => {
                                    this.onImgLoad(col, index, arr.length - 1);
                                }}
                            />
                        )}
                </div>})}
            </div>
        );
    }
}

export default ImageRender;