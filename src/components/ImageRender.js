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

        this.heightMap = new Map();

        // Use the observer to keep track of each image's location
        this.observer = new IntersectionObserver(this.handleIntersection);
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
            this.onImgLoad({ target: false }, true));
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
    onImgLoad = ({ target }, override = false) => {
        
        let { loadedImages, sorted, columns } = this.state, { images } = this.props;
        
        if (target) this.observer.observe(target);

        if (override === false && sorted) return;
        
        if (override || loadedImages >= images.length) {

            /*
                1. Get heights of each of the three images at the bottom of each column.
                2. Get heights of each column, identify the smallest one.
                3. Check what moving each image on either of the larger columns 
                   would do to the column heights, and move the one that makes the best change.
                5. If moving the smallest image would make the columns less/as equal than before, break the while loop.
            */

            let [ col0, col1, col2 ] = [ ...columns ], smallestColumn, heights = {};

            // Only run this if we haven't got all image heights mapped out.
            if (this.heightMap.size !== images.length) {

                // Make a copy of the image column arrays.
                const columnChildren = [ this.col0.children, this.col1.children, this.col2.children ],
                    marginBottom = parseInt(window.getComputedStyle(columnChildren[0][0]).marginBottom);

                // Get individual image sizes + margin from each column's HTMLCollection of images.
                columnChildren.forEach((column, i) => {
                    for (let j = 0; j < column.length; j++) {

                        this.heightMap.set(column[j].firstChild.title, column[j].clientHeight + marginBottom);
                    }
                });
            }

            const calcDiff = (heightA, heightB, heightC) => {
                return (
                    Math.abs(heightA - heightB) +
                    Math.abs(heightB - heightC) +
                    Math.abs(heightC - heightA)
                ) / 3;
            }

            const calcHeights = (columns) => {

                heights = { 
                    column0: { height: 0, imgHeight: 0 },
                    column1: { height: 0, imgHeight: 0 },
                    column2: { height: 0, imgHeight: 0 },
                    avgDifference: 0
                };

                // Get the current height of each column by adding up image heights.
                columns.forEach((column, i) => {
                    column.forEach((image, j) => {
                        const imgHeight = this.heightMap.get(image);
                        i === 0 ? heights.column0.height += imgHeight :
                        i === 1 ? heights.column1.height += imgHeight :
                        heights.column2.height += imgHeight;

                        if (j === column.length - 1) heights[`column${i}`].imgHeight = imgHeight;
                    });                    
                });

                heights.avgDifference = calcDiff(heights.column0.height, heights.column1.height, heights.column2.height);

                let smallestSize = Math.min(heights.column1.height, heights.column2.height, heights.column0.height);

                Object.keys(heights).forEach(column => {
                    if (heights[column].height === smallestSize) smallestColumn = column;
                });
            }

            calcHeights(this.state.columns);

            const checkBestMove = (colA, colB, colC) => {

                let newColAHeightA = heights[colA].height + heights[colB].imgHeight;
                let newColBHeight = heights[colB].height - heights[colB].imgHeight;

                let colBChangeDiff = (
                    Math.abs(newColBHeight - heights[colC].height) +
                    Math.abs(heights[colC].height - newColAHeightA) +
                    Math.abs(newColAHeightA - newColBHeight)
                ) / 3

                let newColAHeightB = heights[colA].height + heights[colC].imgHeight;
                let newColCHeight = heights[colC].height - heights[colC].imgHeight;

                let colCChangeDiff = (
                    Math.abs(heights[colB].height - newColCHeight) +
                    Math.abs(newColCHeight - newColAHeightB) +
                    Math.abs(newColAHeightB - heights[colB].height)
                ) / 3

                
                let newColAHeightC = heights[colA].height + heights[colB].imgHeight + heights[colC].imgHeight;
                newColBHeight = heights[colB].height - heights[colB].imgHeight;
                newColCHeight = heights[colC].height - heights[colC].imgHeight;

                let bothChangeDiff = (
                    Math.abs(newColBHeight - newColCHeight) +
                    Math.abs(newColCHeight - newColAHeightC) +
                    Math.abs(newColAHeightC - newColBHeight)
                ) / 3

                const [ colToChange, bestValue ] = (colBChangeDiff < colCChangeDiff && colBChangeDiff < bothChangeDiff) ? [colB, colBChangeDiff] :
                       (colCChangeDiff < colBChangeDiff && colCChangeDiff < bothChangeDiff) ? [colC, colCChangeDiff] :
                       ['both', bothChangeDiff];


                if (bestValue >= heights.avgDifference) return false;

                return [ colToChange, bestValue ];

            }

            let bestMove = [];

            while (bestMove !== false) {

                switch(smallestColumn) {
                    case 'column0': 
    
                        bestMove = checkBestMove('column0', 'column1', 'column2');
    
                        if (bestMove === false) break;
    
                        switch(bestMove[0]) {
                            
                            case 'column1':
                                col0.push(col1.pop());
                                break;
                            
                            case 'column2':
                                col0.push(col2.pop());
                                break;
    
                            default:
                                col0.push(col1.pop(), col2.pop());
                        }

                        calcHeights([col0, col1, col2]);
    
                        break;
    
                    case 'column1': 
    
                        bestMove = checkBestMove('column1', 'column0', 'column2');
    
                        if (bestMove === false) break;
    
                        switch(bestMove[0]) {
                            
                            case 'column0':
                                col1.push(col0.pop());
                                break;
                            
                            case 'column2':
                                col1.push(col2.pop());
                                break;
    
                            default:
                                col1.push(col0.pop(), col2.pop());
                        }

                        calcHeights([col0, col1, col2]);
    
                        break;
    
                    default: 
                        bestMove = checkBestMove('column2', 'column0', 'column1');
    
                        if (bestMove === false) break;
    
                        switch(bestMove[0]) {
                            
                            case 'column0':
                                col2.push(col0.pop());
                                break;
                            
                            case 'column1':
                                col2.push(col1.pop());
                                break;
    
                            default:
                                col2.push(col0.pop(), col1.pop());
                        }

                        calcHeights([col0, col1, col2]);
                }
            }

            // Set state with the finalised column arrays.
            this.setState({ columns: [ col0, col1, col2 ], loadedImages: loadedImages + 1, sorted: true });

        } else if (loadedImages < images.length) this.setState({ loadedImages: loadedImages + 1 });
    };

    // When an image enters/leaves the viewport, set the src to be thumbnail/full image
    handleIntersection = entries => {
        
        entries.forEach(entry => {

            const fileName = entry.target.alt.replace('From ', '');

            if (entry.isIntersecting) {

                if (entry.target.clientWidth > 230 && entry.target.src.includes('/thumbnails/')) {

                    entry.target.src = `${this.props.apiURL}:5001/media/${fileName}`;
                
                } else {


                    if (entry.target.clientWidth <= 230) {

                        entry.target.src = fileName.includes('.gif') ? 
                            `${this.props.apiURL}:5001/media/thumbnails/live-${fileName}` : 
                            `${this.props.apiURL}:5001/media/thumbnails/${fileName}`;
                        
                    } else {
                        entry.target.src = `${this.props.apiURL}:5001/media/thumbnails/${fileName}`;
                    }
                }

            } else {

                if (entry.target.clientWidth > 230 && entry.target.src.match(/live-.*gif/) !== null) {
                    
                    entry.target.src = `${this.props.apiURL}:5001/media/thumbnails/live-${fileName}`;
                
                } else {
                    entry.target.src = `${this.props.apiURL}:5001/media/thumbnails/${fileName}`;
                }
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
                                    title={imageLink}
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