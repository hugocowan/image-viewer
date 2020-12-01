import React from 'react';

class ImageRender extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            columns: this.splitImages(props.columns, props.images),
            currentlySorting: false,
            sorted: false,
            loadedImages: 0,
            firstTime: true,
            sorting: props.sorting,
        };

        // Use the observer to keep track of each image's location
        this.observer = new IntersectionObserver(this.handleIntersection);
    }

    componentDidUpdate() {

        if (!this.props.updateNeeded) return;
        this.props.updateDone();

        this.setState({ columns: this.splitImages(this.props.columns, this.props.images), sorting: this.props.sorting }, () =>
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

        let { loadedImages, currentlySorting, sorted, columns } = this.state, { images, sideMargin } = this.props;

        // Add images to the observer as their onload functions fire.
        if (target) this.observer.observe(target);

        // If images are already sorted, don't run this again.
        if ((override === false && currentlySorting) || (override === false && sorted)) return;

        
        // Only run sorting when all images have loaded.
        if (override || loadedImages >= images.length) {

            this.setState({ currentlySorting: true });

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
                const heightMap = {};
                
                // Get individual image sizes + margin from each column's HTMLCollection of images.
                allColumns.map(col => this[`${col}`].children).forEach(column => [].slice.call(column).forEach(img => heightMap[img.firstChild.title] = img.clientHeight + ( (sideMargin <= 2) ? sideMargin - 4 : sideMargin )));

                // Reset height data from previous function runs.
                heights = { avgDifference: 0, smallestCol: '' };
                for (let i = 0; i < columns.length; i++) heights[`col${i}`] = { height: 0, imgHeight: 0 };

                // Store the current height of each column by adding up image heights.
                _columns.forEach((column, i) => column.forEach((image, j) => {
                    const imgHeight = heightMap[image];
                    heights[`col${i}`].height += imgHeight;
                    if (j === column.length - 1) heights[`col${i}`].imgHeight = imgHeight;
                }));

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

            checkColumns = (columnNumber) => new Promise(resolve => setTimeout(resolve, 200))
                .then(() => {

                    if (columnNumber !== this.state.columns.length) throw new Error('Column number has changed since this function was called.');

                    const oldHeights = JSON.stringify(heights);
                    calcHeights(columns);
                    return JSON.stringify(heights) === oldHeights;
                })
                .then(bool => {

                    if (bool === false) {
                        checkColumns(columnNumber);
                        return;
                    }

                    while (bestMove !== false) {
                        makeBestMove();
                    }

                    // Set state with the finalised column arrays.
                    this.setState({
                        columns: allColumns.map(col => this[`_${col}`]),
                        loadedImages: loadedImages + 1, currentlySorting: false, sorted: true
                    });
                })
                .catch(err => console.log(err));

            calcHeights(columns);
            checkColumns(columns.length);

        } else if (loadedImages < images.length) this.setState({ loadedImages: loadedImages + 1 });
    };

    // When an image enters/leaves the viewport, set the src to be thumbnail/full image
    handleIntersection = entries => entries.forEach(entry => entry.target.src = `${this.props.apiURL}:${this.props.apiPORT}/media/` + ( 
        (entry.isIntersecting && (entry.target.clientWidth > 230) && entry.target.src.includes('/thumbnails/')) ? '' : 
        (
            (entry.isIntersecting && (entry.target.clientWidth <= 230) && entry.target.src.match(/live-.*gif/)) || 
            (!entry.isIntersecting && (entry.target.clientWidth > 230) && entry.target.alt.includes('.gif'))
        ) ? 'thumbnails/live-' : 'thumbnails/'
    ) + entry.target.alt.replace('From ', ''));

    render() {

        const sideMargin = ('' === this.props.sideMargin) ? 5 : this.props.sideMargin;

        return (
            <div className={`main ${this.props.fixNavbar}`}>
                <div className='img-container'>
                    {this.state.columns.map((col, i) => {
                        return <div key={i} className='img-wrapper' ref={c => this[`col${i}`] = c} style={{ marginLeft: sideMargin + 'px', marginRight: sideMargin + 'px', width: 'calc(' + 100 / this.state.columns.length + '% - ' + sideMargin * 2 + 'px' }}>
                            {col.map(imageLink =>
                            <div
                                className={`image ${imageLink} ${this.props.imagesForDeletion.includes(imageLink)}`}
                                style={{ marginBottom: (sideMargin <= 2) ? sideMargin - 4 : sideMargin  + 'px' }}
                                alt={`From ${imageLink}`} key={imageLink}
                            >
                                <img
                                    onLoad={this.onImgLoad} title={imageLink} alt={`From ${imageLink}`}
                                    src={`${this.props.apiURL}:${this.props.apiPORT}/media/thumbnails/${imageLink}`}
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
