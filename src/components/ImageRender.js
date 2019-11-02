import React from 'react';

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
            sortType: props.sortType,
        };

        // Declare colHeight vars here so they can be referenced anywhere.
        this.col0Height = 0;
        this.col1Height = 0;
        this.col2Height = 0;
        this.marginBottom = null;

        // Use the observer to keep track of each image's location
        this.observer = new IntersectionObserver(this.handleIntersection, {});
    }

    componentDidUpdate() {

        if (!this.props.updateNeeded) return;

        const columns = [ [], [], [] ];
        
        this.props.images.forEach((image, index) => {

            // Split the image array into three equal columns
            index % 3 === 0 ? columns[2].push(image) :
            index % 2 === 0 ? columns[1].push(image) :
                columns[0].push(image);
        });
        
        this.props.updateDone();

        this.setState({ columns, sortType: this.props.sortType }, () => 
            this.onImgLoad({ target: false }, true, 500));
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
    onImgLoad = ({ target }, override = false, delay = null) => {
        
        let { loadedImages, sorted, columns } = this.state, { images } = this.props;

        if (target) this.observer.observe(target);

        if (override === false && sorted) return;
        
        if (override || loadedImages >= images.length) {

            setTimeout(() => {
                // Make a copy of the image column arrays, initialise other vars.
                const columnChildren = [ this.col0.children, this.col1.children, this.col2.children ];

                if (this.marginBottom === null) {
                    this.marginBottom = parseInt(window.getComputedStyle(columnChildren[0][0]).marginBottom);
                }

                
                let [ col0, col1, col2 ] = [ ...columns ],
                col0Heights = [], col1Heights = [], col2Heights = [];
                
                // Get individual image sizes + margin from each column's HTMLCollection of images.
                columnChildren.forEach((column, i) => {
                    for (let j = 0; j < column.length; j++) {
                        
                        i === 0 ? col0Heights.push(column[j].clientHeight + this.marginBottom) :
                        i === 1 ? col1Heights.push(column[j].clientHeight + this.marginBottom) :
                        col2Heights.push(column[j].clientHeight + this.marginBottom);
                    }
                });

                console.log(col0Heights.reduce((a, b) => a + b));

                // Get max image height.
                let maxHeight = Math.max(
                    col0Heights[col0Heights.length - 1], 
                    col1Heights[col1Heights.length - 1],
                    col2Heights[col2Heights.length - 1],
                );

                if (Math.min(col0Heights.length, col1Heights.length, col2Heights.length) === 0) return;
                
                // Get the current height of each column by adding up the image heights.
                this.col0Height = col0Heights.reduce((a, b) => a + b);
                this.col1Height = col1Heights.reduce((a, b) => a + b);
                this.col2Height = col2Heights.reduce((a, b) => a + b);

                // Find the smallest column to add an image to.
                const findSmallestColumn = (col, colHeights, colHeight) => {
                    
                    switch(Math.min(this.col0Height, this.col1Height, this.col2Height)) {

                        case this.col0Height:
                            moveImage(col0, 'col0Height', col0Heights, col, colHeights, colHeight);
                            break;

                        case this.col1Height:
                            moveImage(col1, 'col1Height', col1Heights, col, colHeights, colHeight);
                            break;

                        default:
                            moveImage(col2, 'col2Height', col2Heights, col, colHeights, colHeight);
                            break;
                    }
                };

                // Move image from larger to smaller column, update column and image heights. + 5 for margin.
                const moveImage = (smallCol, smallColHeight, smallColHeights, bigCol, bigColHeights, bigColHeight) => {

                    smallCol.push(bigCol.pop());
                    smallColHeights.push(bigColHeights.pop());
                    this[smallColHeight] = smallColHeights.reduce((a, b) => a + b);
                    this[bigColHeight] = bigColHeights.reduce((a, b) => a + b);
                    maxHeight = Math.max(
                        col0Heights[col0Heights.length - 1], 
                        col1Heights[col1Heights.length - 1],
                        col2Heights[col2Heights.length - 1],
                    );
                };

                /*
                    1. Get heights of each of the three images at the bottom of each column.
                    2. Get heights of each column.
                    3. Check whether moving the smallest image would make the columns more equal in size.
                    4. Move the smallest image to the column that gives the best equality.
                    5. If moving the smallest image would make the columns less/as equal than before, break the while loop.
                */

                if (override) {


                }

                // console.log(override, this.col0Height, this.col0, this.col0.lastChild);


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

                // Set state with the finalised column arrays.
                this.setState({ columns: [ col0, col1, col2 ], loadedImages: loadedImages + 1, sorted: true });
            }, delay || 1000);

        } else if (loadedImages < images.length) this.setState({ loadedImages: loadedImages + 1 });
    };

    // When an image enters/leaves the viewport, set the src to be thumbnail/full image
    handleIntersection = entries => {
        
        entries.forEach(entry => {

            // Replace thumbnails with full size imagery when image enters viewport.
            const fileName = entry.target.alt.replace('From ', '');

            if (entry.intersectionRatio > 0) {

                // If we're on a mobile in portrait mode, load live thumbnails of gifs.
                if (entry.target.clientWidth <= 127 && fileName.includes('.gif')) {

                    entry.target.src = `${this.props.apiURL}:5001/media/thumbnails/live-${fileName}`;
                
                }  else {

                    entry.target.src = `${this.props.apiURL}:5001/media/${fileName}`;
                } 

            } else if (entry.target.clientWidth > 127) {

                entry.target.src = `${this.props.apiURL}:5001/media/thumbnails/${fileName}`;
            }
    
        })
    }

    render() {

        return (
            <div className={`main ${this.props.makeFixed}`}>
                <div className='img-container'>
                    {this.state.columns.map((col, i) => {
                        return <div key={i} className='img-wrapper' ref={c => this[`col${i}`] = c}>
                            {col.map(imageLink =>
                            <div 
                                className={`image ${imageLink} ${this.props.imagesForDeletion.includes(imageLink)}`} 
                                alt={`From ${imageLink}`} 
                                key={imageLink}
                            >
                                <img
                                    onLoad={this.onImgLoad}
                                    alt={`From ${imageLink}`}
                                    src={`${this.props.apiURL}:5001/media/thumbnails/${imageLink}`}
                                    onClick ={() => this.props.handleSelectedImage(imageLink)}
                                />
                            </div>
                            )}
                    </div>})}
                </div>
            </div>
        );
    }
}

export default ImageRender;