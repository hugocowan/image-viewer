import React from 'react';
import { timeout } from 'q';

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
            sorting: false,
            sorted: false,
            loadedImages: 0,
            firstTime: true,
            sortType: props.sortType,
        };

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

    /*
        1. Get heights of each of the three images at the bottom of each column.
        2. Get heights of each column, identify the smallest one.
        3. Check what moving each image on either of the larger columns
            would do to the column heights, and move the one that makes the best change.
        5. If moving the smallest image would make the columns less/as equal than before, break the while loop.
    */
    onImgLoad = ({ target }, override = false) => {

        let { loadedImages, sorting, sorted, columns } = this.state, { images } = this.props;

        // Add images to the observer as their onload functions fire.
        if (target) this.observer.observe(target);

        // If images are already sorted, don't run this again.
        if ((override === false && sorting) || (override === false && sorted)) return;

        // Only run sorting when all images have loaded.
        if (override || loadedImages >= images.length) {

            this.setState({ sorting: true });

            let heights = {}, bestMove = undefined, counter = 0, checkColumns;
            this._col0 = columns[0]; this._col1 = columns[1]; this._col2 = columns[2];

            // Get the average difference in height between each column of images.
            const getDiff = (colAHeight, colBHeight, colCHeight) => {
                return (
                    Math.abs(colAHeight - colBHeight) +
                    Math.abs(colBHeight - colCHeight) +
                    Math.abs(colCHeight - colAHeight)
                ) / 3;
            };

            // Get height data for each of the columns
            const calcHeights = _columns => {

                // Make array containing references to all image elements.
                const columnChildren = [ this.col0.children, this.col1.children, this.col2.children ],
                    marginBottom = parseInt(window.getComputedStyle(columnChildren[0][0]).marginBottom),
                    heightMap = {};

                // Get individual image sizes + margin from each column's HTMLCollection of images.
                columnChildren.forEach((column, i) => {
                    for (let j = 0; j < column.length; j++) {

                        heightMap[column[j].firstChild.title] = column[j].clientHeight + marginBottom;
                    }
                });

                // Reset height data from previous function runs.
                heights = {
                    col0: { height: 0, imgHeight: 0 },
                    col1: { height: 0, imgHeight: 0 },
                    col2: { height: 0, imgHeight: 0 },
                    avgDifference: 0,
                    smallestCol: ''
                };

                // Store the current height of each column by adding up image heights.
                _columns.forEach((column, i) => {
                    column.forEach((image, j) => {
                        const imgHeight = heightMap[image];
                        i === 0 ? heights.col0.height += imgHeight :
                        i === 1 ? heights.col1.height += imgHeight :
                        heights.col2.height += imgHeight;

                        if (j === column.length - 1) heights[`col${i}`].imgHeight = imgHeight;
                    });
                });

                heights.avgDifference = getDiff(heights.col1.height, heights.col2.height, heights.col0.height);

                let smallestSize = Math.min(heights.col1.height, heights.col2.height, heights.col0.height);

                Object.keys(heights).forEach(col => {
                    if (heights[col].height === smallestSize) heights.smallestCol = col;
                });
            };

            // Calculate the best column(s) to take an image from.
            const makeBestMove = () => {
                
                let colA = heights.smallestCol,
                    [ colB, colC ] = heights.smallestCol === 'col0' ? ['col1', 'col2'] :
                        heights.smallestCol === 'col1' ? ['col0', 'col2'] :
                            ['col0', 'col1'],
                    colBChangeDiff = getDiff(heights[colB].height - heights[colB].imgHeight,
                        heights[colC].height,
                        heights[colA].height + heights[colB].imgHeight),

                    colCChangeDiff = getDiff(heights[colB].height,
                        heights[colC].height - heights[colC].imgHeight,
                        heights[colA].height + heights[colC].imgHeight),

                    bothChangeDiff = getDiff(heights[colB].height - heights[colB].imgHeight,
                        heights[colC].height - heights[colC].imgHeight,
                        heights[colA].height + heights[colB].imgHeight + heights[colC].imgHeight),

                    smallestDiff = Math.min(colBChangeDiff, colCChangeDiff, bothChangeDiff);

                // If the smallest new average difference between columns >= the current avg distance, we're done.

                bestMove = colBChangeDiff === smallestDiff ? colB : colCChangeDiff === smallestDiff ? colC : 'both';

                // console.log(colBChangeDiff, colCChangeDiff, bothChangeDiff);
                // console.log(counter, 'smallestDiff:', smallestDiff, 'bestMove:', bestMove, heights);

                if (smallestDiff >= heights.avgDifference) {
                    bestMove = false;
                    return;
                }

                if (bestMove === colB || bestMove === colC) {

                    this[`_${colA}`].push(this[`_${bestMove}`].pop());

                } else if (bestMove === 'both') {

                    this[`_${colA}`].push(this[`_${colB}`].pop(), this[`_${colC}`].pop());
                }

                calcHeights([this._col0, this._col1, this._col2]);
            };

            checkColumns = (delay) => new Promise(resolve => timeout(resolve, delay))
            .then(() => {

                const oldHeights = JSON.stringify(heights);
                calcHeights(columns);
                console.log(JSON.stringify(heights) === oldHeights);
                return JSON.stringify(heights) === oldHeights;
            })
            .then(bool => {

                if (bool === false) {
                    
                    checkColumns(500);
                    return;
                }

                while (bestMove !== false && counter < 100) {
                    counter++;
                    makeBestMove();
                }

                // Set state with the finalised column arrays.
                this.setState({
                    columns: [this._col0, this._col1, this._col2],
                    loadedImages: loadedImages + 1, sorting: false, sorted: true
                });
            });

            calcHeights(columns);
            checkColumns(500);


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
    };

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
