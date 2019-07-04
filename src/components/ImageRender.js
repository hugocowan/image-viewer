import React from 'react';
import Modal from './Modal';

class ImageRender extends React.Component {

    constructor(props) {
        super(props);

        const columns = [ [], [], [] ];
        
        props.images.forEach((image, index) => {

            // Split the image array into three equal columns
            index % 3 === 0 ? columns[2].push(image) :
            index % 2 === 0 ? columns[1].push(image) :
                columns[0].push(image);
        });

        this.state = {
            columns,
            sorted: false,
            loadedImages: 0,
            selectedImage: '',
        };

        // Declare colHeight vars here so they can be referenced anywhere.
        this.col0Height = 0;
        this.col1Height = 0;
        this.col2Height = 0;

        this.observer = new IntersectionObserver(this.handleIntersection);
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
    onImgLoad = ({ target }) => {

        let { loadedImages } = this.state;

        this.observer.observe(target);
        
        if (!this.state.sorted && loadedImages + 1 === this.props.images.length) {

            const _this = this, columns = [ this.col0.children, this.col1.children, this.col2.children ];

            // Make a copy of the image columns, initialise other vars.
            let [ col0, col1, col2 ] = [ ...this.state.columns ],
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
            this.col0Height = col0Heights.reduce((a, b) => a + b);
            this.col1Height = col1Heights.reduce((a, b) => a + b);
            this.col2Height = col2Heights.reduce((a, b) => a + b);

            // While diff between columns > max image height, keep moving images.
            while ( Math.abs(this.col0Height - this.col1Height) > maxHeight ||
                    Math.abs(this.col1Height - this.col2Height) > maxHeight ||
                    Math.abs(this.col2Height - this.col0Height) > maxHeight  ) 
            {
                // Find the largest column to take an image from.
                switch(Math.max(this.col0Height, this.col1Height, this.col2Height)) {

                    case this.col0Height: 
                        findSmallestColumn(col0, col0Heights, 'col0Height');
                        break;

                    case this.col1Height: 
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
            this.setState({ columns: [ col0, col1, col2 ], loadedImages: loadedImages + 1, sorted: true });

        } else {

            if (loadedImages < this.props.images.length) {
                this.setState({ loadedImages: loadedImages + 1 });
            }
        }
    }

    // When an image enters/leaves the viewport, set the src to be thumbnail/full image
    handleIntersection = entries => 
        entries.forEach(entry =>
            entry.intersectionRatio > 0 ? entry.target.src = require(`../assets/${entry.target.classList[1]}`)
            : entry.target.src = require(`../assets/thumbnails/${entry.target.classList[1]}`));

    render() {

        return (
            <div>
                {this.state.selectedImage && 
                <Modal 
                    imageLink={this.state.selectedImage}
                    onClick ={() => this.setState({ selectedImage: '' })}
                />}
                <div className='img-container'>
                    {this.state.columns.map((col, i) => {

                        return <div key={col} className='img-wrapper' ref={c => this[`col${i}`] = c}>
                            {col.map(imageLink =>
                                <img
                                    onLoad={this.onImgLoad}
                                    alt={`From ${imageLink}`}
                                    key={imageLink}
                                    ref={c => this[imageLink] = c}
                                    className={`image ${imageLink}`}
                                    src={require(`../assets/thumbnails/${imageLink}`)}
                                    onClick ={() => this.setState({ selectedImage: imageLink })}
                                />
                            )}
                    </div>})}
                </div>
            </div>
        );
    }
}

export default ImageRender;