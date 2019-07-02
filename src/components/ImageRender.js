import React from 'react';

class ImageRender extends React.Component {

    constructor(props) {
        super(props);

        const oneThird = Math.ceil((props.images.length - 1) / 3),
            twoThirds = props.images.length - 1 - oneThird;

        this.state = {

            // Split the image array into three equal columns
            columns: [
                props.images.slice(0, oneThird),
                props.images.slice(oneThird, twoThirds),
                props.images.slice(twoThirds, props.images.length - 1)
            ],
            sorted: false,  
        };

        // Declare colHeight vars here so they can be referenced anywhere.
        this.col0Height = 0;
        this.col1Height = 0;
        this.col2Height = 0;
    }
    
    // Ensure image column heights <= biggest image height:
    // Wait for images to load.
    // Make copies of each column array so we aren't manipulating state constantly.
    // Get individual image sizes from each column, and the size of the biggest image.
    // If diff between column heights > max image height, move an image.
    // Move image from biggest column to smallest column.
    // Update the new column sizes.
    // Check again until the column height difference <= max image height.
    // Once the columns are leveled out, set state with the new column arrays.
    onImgLoad = () => {

        const _this = this, columns = [ this.col0.children, this.col1.children, this.col2.children ];

        setTimeout(() => {

            // Make a copy of the image columns, initialise other vars.
            let [ col0, col1, col2 ] = [ ..._this.state.columns ],
                maxHeight = 0,
                col0Heights = [],
                col1Heights = [],
                col2Heights = [];
            
            // Get individual image sizes for each column array, in order. Also get max image height.
            columns.forEach((col, index) => {
                for (let i = 0; i < col.length; i++) {
                    
                    index === 0 ? col0Heights.push(col[i].clientHeight) :
                    index === 1 ? col1Heights.push(col[i].clientHeight) :
                                    col2Heights.push(col[i].clientHeight);

                    if (maxHeight < col[i].clientHeight) maxHeight = col[i].clientHeight;
                }
            });
            
            // Get the current height of each column by adding up the image heights.
            _this.col0Height = col0Heights.reduce((a, b) => a + b);
            _this.col1Height = col1Heights.reduce((a, b) => a + b);
            _this.col2Height = col2Heights.reduce((a, b) => a + b);

            // While diff between columns > max image height, keep moving images.
            while ( Math.abs(_this.col0Height - _this.col1Height) > maxHeight ||
                    Math.abs(_this.col1Height - _this.col2Height) > maxHeight ||
                    Math.abs(_this.col2Height - _this.col0Height) > maxHeight  ) 
            {
                // Find the largest column to take an image from.
                switch(Math.max(_this.col0Height, _this.col1Height, _this.col2Height)) {

                    case _this.col0Height: 
                        findSmallestColumn(col0, col0Heights, 'col0Height');
                        break;

                    case _this.col1Height: 
                        findSmallestColumn(col1, col1Heights, 'col1Height');
                        break;

                    default:
                        findSmallestColumn(col2, col2Heights, 'col2Height');
                        break;
                }
            }

            function findSmallestColumn(col, colHeights, colHeight) {
                
                // Find the smallest column to add an image to.
                switch(Math.min(_this.col0Height, _this.col1Height, _this.col2Height)) {

                    case _this.col0Height:
                        moveImage(col0, 'col0Height', col0Heights, col, colHeights, colHeight);
                        break;

                    case _this.col1Height:
                        moveImage(col1, 'col1Height', col1Heights, col, colHeights, colHeight);
                        break;

                    default:
                        moveImage(col2, 'col2Height', col2Heights, col, colHeights, colHeight);
                        break;
                }
            }

            // Move image from larger to smaller column, update column and image heights.
            function moveImage(colA, colAHeight, colAHeights, colB, colBHeights, colBHeight) {

                colA.push(colB.pop());
                colAHeights.push(colBHeights.pop());
                _this[colAHeight] = colAHeights.reduce((a, b) => a + b);
                _this[colBHeight] = colBHeights.reduce((a, b) => a + b);
            }

            // Set state with the finalised column arrays.
            _this.setState({ columns: [ col0, col1, col2 ], sorted: true });

        }, 1000);
    }

    render() {

        return (
            <div className='img-container'>
                {this.state.columns.map((col, i) => {

                    return <div key={col} className='img-wrapper' ref={c => this[`col${i}`] = c}>
                        {col.map((imageLink, index, arr) =>
                            <img
                                key={imageLink}
                                alt={`From ${imageLink}`}
                                src={require(`../assets/${imageLink}`)}
                                onLoad={() => !this.state.sorted && i === 2 && index === arr.length - 1 && this.onImgLoad()}
                            />
                        )}
                </div>})}
            </div>
        );
    }
}

export default ImageRender;