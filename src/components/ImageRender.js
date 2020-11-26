import React from 'react';

class ImageRender extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            columns: this.splitImages(props.columns, props.images),
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
        this.props.updateDone();

        this.setState({ columns: this.splitImages(this.props.columns, this.props.images), sortType: this.props.sortType }, () =>
            this.onImgLoad({ target: false }, true));
    }

    splitImages = (columns, images) => {
        const cols = columns.map(() => []);
        images.forEach(image => {
            const smallestColumnIndex = cols.reduce((finalIndex, column, i) => (column.length < cols[finalIndex].length) ? i : finalIndex, 0);
            cols[smallestColumnIndex].push(image);
        });
        return cols;
    };

    /*
        1. Get heights of each bottom image.
        2. Get heights of each column, identify the smallest one.
        3. Check what moving each image on either of the larger columns
           would do to the column heights, and move the one that makes the best change.
        5. If moving the smallest image would make the columns less/as even in height, break the while loop.
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

            let heights = {}, bestMove = undefined, checkColumns, allColumns = [];
            
            // Add each column element to this and allColumns so they're accessible.
            for (let i = 0; i < columns.length; i++) {
                this[`_col${i}`] = columns[i];
                allColumns.push(`col${i}`);
            }

            // Get the average difference in height between each column of images.
            const getDiff = heightArray => heightArray.reduce((diffs, height, i) => 
                diffs + heightArray.reduce((total, otherHeight, j) => 
                    (j >= i) ? total + Math.abs(height - otherHeight) : total, 0), 0) / heightArray.length;
      
            // Get height data for each of the columns
            const calcHeights = _columns => {

                // Make array containing references to all image elements.
                const columnChildren = allColumns.map(col => this[`${col}`].children),
                    child = columnChildren.reduce((child, childrenArray) => (null === child && childrenArray[0]) ? childrenArray[0] : child, null),
                    marginBottom = null !== child ? parseInt(window.getComputedStyle(child).marginBottom) : 0,
                    heightMap = {};

                // Get individual image sizes + margin from each column's HTMLCollection of images.
                columnChildren.forEach(column => {
                    for (let i = 0; i < column.length; i++) {
                        heightMap[column[i].firstChild.title] = column[i].clientHeight + marginBottom;
                    }
                });

                // Reset height data from previous function runs.
                heights = { avgDifference: 0, smallestCol: '' };
                for (let i = 0; i < columns.length; i++) heights[`col${i}`] = { height: 0, imgHeight: 0 };

                // Store the current height of each column by adding up image heights.
                _columns.forEach((column, i) => {
                    column.forEach((image, j) => {
                        const imgHeight = heightMap[image];
                        heights[`col${i}`].height += imgHeight;
                        if (j === column.length - 1) heights[`col${i}`].imgHeight = imgHeight;
                    });
                });

                const heightArray = Object.keys(heights).reduce((arr, col) => (heights[col].height) ? [ ...arr, heights[col].height ] : arr, []);
                heights.avgDifference = getDiff(heightArray);

                Object.keys(heights).forEach(col => {
                    if (heights[col].height === Math.min(...heightArray)) heights.smallestCol = col;
                });

            };

            // Calculate the best column(s) to take an image from.
            const makeBestMove = () => {
                const allColumnsButSmallest = allColumns.filter(c => heights.smallestCol !== c);

                // Get the best average difference after moving one or more columns sorted by image height, smallest first.
                bestMove = allColumnsButSmallest.sort((colA, colB) => heights[colA].imgHeight - heights[colB].imgHeight).reduce((acc, column, i, a) => {
                    
                    let changingCols = a.filter((sCol, j) => j <= i), diff = null;
                    
                    const heightsExcludingChangedColumns = allColumnsButSmallest.reduce((acc, col) => a.filter((sCol, j) => j > i).includes(col) ? [ ...acc, heights[col].height ] : acc, []),
                        changedColumnHeights = changingCols.map(col => heights[col].height - heights[col].imgHeight),
                        smallestColumnHeight = heights[heights.smallestCol].height + changingCols.reduce((acc, col) => acc + heights[col].imgHeight, 0),
                        otherHeights = a.reduce((arr, otherColumn) => (otherColumn !== column) ? [ ...arr, heights[otherColumn].height ] : arr, []),
                        multiColDiff = getDiff([ ...heightsExcludingChangedColumns, ...changedColumnHeights, smallestColumnHeight ]),
                        singleColDiff = getDiff([ ...otherHeights, heights[column].height - heights[column].imgHeight, heights[heights.smallestCol].height + heights[column].imgHeight]);
                          
                    [ changingCols, diff ] = (singleColDiff >= multiColDiff) ? [ changingCols, multiColDiff ] : [ [ column ], singleColDiff ];

                    return (null === acc.diff || acc.diff > diff) ? { changingCols, diff } : acc;
                }, { changingCols: [], diff: null });

                // If the smallest new average difference between columns >= the current avg distance, we're done.
                if (bestMove.diff >= heights.avgDifference) {
                    bestMove = false;
                    return;
                }

                bestMove.changingCols.forEach(col => this[`_${heights.smallestCol}`].push(this[`_${col}`].pop()));
                calcHeights(allColumns.map(col => this[`_${col}`]));
            };

            checkColumns = () => new Promise(resolve => setTimeout(resolve, 200))
                .then(() => {

                    const oldHeights = JSON.stringify(heights);
                    calcHeights(columns);
                    return JSON.stringify(heights) === oldHeights;
                })
                .then(bool => {

                    if (bool === false) {
                        checkColumns();
                        return;
                    }

                    while (bestMove !== false) {
                        makeBestMove();
                    }

                    // Set state with the finalised column arrays.
                    this.setState({
                        columns: allColumns.map(col => this[`_${col}`]),
                        loadedImages: loadedImages + 1, sorting: false, sorted: true
                    });
                });

            calcHeights(columns);
            checkColumns();

        } else if (loadedImages < images.length) this.setState({ loadedImages: loadedImages + 1 });
    };

    // When an image enters/leaves the viewport, set the src to be thumbnail/full image
    handleIntersection = entries => entries.forEach(entry => {
        
        const filename = entry.target.alt.replace('From ', '');
        let src = `${this.props.apiURL}:5001/media/`, bigScreen = entry.target.clientWidth > 230;

        if (entry.isIntersecting) {

            src += bigScreen && entry.target.src.includes('/thumbnails/') ? `${filename}` :
                !bigScreen && filename.includes('.gif') ? `thumbnails/live-${filename}` :
                `thumbnails/${filename}`;

        } else {

            src += bigScreen && entry.target.src.match(/live-.*gif/) !== null ?
                `thumbnails/live-${filename}` : `thumbnails/${filename}`;
        }

        entry.target.src = src;
    });

    render() {
        return (
            <div className={`main ${this.props.makeFixed}`}>
                <div className='img-container'>
                    {this.state.columns.map((col, i) => {
                        return <div key={i} className='img-wrapper' ref={c => this[`col${i}`] = c} style={{width: 'calc(' + 100 / this.state.columns.length + '% - 10px'}}>
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
