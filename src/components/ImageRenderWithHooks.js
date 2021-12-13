import React, { useEffect, useState } from 'react';

const ImageRenderWithHooks = function(props) {

    const splitImages = (columns, images) => {
        const cols = columns.map(() => []);
        images.forEach(image => {
            const smallestColumnIndex = cols.reduce((finalIndex, column, i) => (column.length < cols[finalIndex].length) ? i : finalIndex, 0);
            cols[smallestColumnIndex].push(image);
        });
        return cols;
    };

    // When an image enters/leaves the viewport, set the src to be thumbnail/full image
    const handleIntersection = entries => entries.forEach(entry => {
            
        const filename = entry.target.alt.replace('From ', '');
        let src = `${props.apiURL}:5001/media/`, bigScreen = entry.target.clientWidth > 230;

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

    const [ columns, setColumns ] = useState(splitImages(props.columns, props.images)), 
        [ sorting, setSorting ] = useState(false), 
        [ sorted, setSorted ] = useState(false), 
        [ loadedImages, setLoadedImages ] = useState(0),
        [ sortType, setSortType ] = useState(props.sortType),
        [ observer ] = useState(new IntersectionObserver(handleIntersection)),
        [ columnHTML ] = useState([]),
        [ colFileNames ] = useState([]); 

    /*
        1. Get heights of each bottom image.
        2. Get heights of each column, identify the smallest one.
        3. Check what moving each image on either of the larger columns
           would do to the column heights, and move the one that makes the best change.
        5. If moving the smallest image would make the columns less/as even in height, break the while loop.
    */
        const onImgLoad = ({ target }, override = false) => {

            let { images } = props;
    
            // Add images to the observer as their onload functions fire.
            if (target) observer.observe(target);
    
            // If images are already sorted, don't run this again.
            if ((override === false && sorting) || (override === false && sorted)) return;
    
            
            // Only run sorting when all images have loaded.
            if (override || loadedImages >= images.length) {
    
                setSorting(true);
    
                let heights = {}, bestMove = undefined, checkColumns, allColumns = [];
                
                // Add each column element to this and allColumns so they're accessible.
                for (let i = 0; i < columns.length; i++) {
                    colFileNames[i] = columns[i];
                    allColumns.push(i);
                }
    
                // Get the average difference in height between each column of images.
                const getDiff = heightArray => heightArray.reduce((diffs, height, i) => 
                    diffs + heightArray.reduce((total, otherHeight, j) => 
                        (j >= i) ? total + Math.abs(height - otherHeight) : total, 0), 0) / heightArray.length;
          
                // Get height data for each of the columns
                const calcHeights = _columns => {
    
                    // Make array containing references to all image elements.
                    const columnChildren = allColumns.map(colIndex => columnHTML[colIndex].children),
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
                    for (let i = 0; i < columns.length; i++) heights[i] = { height: 0, imgHeight: 0 };
    
                    // Store the current height of each column by adding up image heights.
                    _columns.forEach((column, i) => {
                        column.forEach((image, j) => {
                            const imgHeight = heightMap[image];
                            heights[i].height += imgHeight;
                            if (j === column.length - 1) heights[i].imgHeight = imgHeight;
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
    
                    bestMove.changingCols.forEach(colIndex => colFileNames[heights.smallestCol].push(colFileNames[colIndex].pop()));
                    calcHeights(allColumns.map(colIndex => colFileNames[colIndex]));
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
                        setColumns(allColumns.map(colIndex => colFileNames[colIndex]));
                        setLoadedImages(loadedImages + 1);
                        setSorting(false);
                        setSorted(true);
                    });
    
                calcHeights(columns);
                checkColumns();
    
            } else if (loadedImages < images.length) setLoadedImages(loadedImages + 1);
        };

        useEffect(() => {
            console.log('hey');
            if (!props.updateNeeded) return;
            props.updateDone();
    
            console.log('before:', columns, sortType);
            setColumns(splitImages(props.columns, props.images)) 
            setSortType(props.sortType);
            console.log('after:', columns, sortType);
    
            onImgLoad({ target: false }, true);
        }, [props, columns, sortType, onImgLoad]);

        return (
            <div className={`main ${props.makeFixed}`}>
                <div className='img-container'>
                    {columns.map((col, i) => {
                        return <div key={i} className='img-wrapper' ref={c => columnHTML[i] = c} style={{width: 'calc(' + 100 / columns.length + '% - 10px'}}>
                            {col.map(imageLink =>
                            <div
                                className={`image ${imageLink} ${props.imagesForDeletion.includes(imageLink)}`}
                                alt={`From ${imageLink}`}
                                key={imageLink}
                            >
                                <img
                                    onLoad={onImgLoad}
                                    title={imageLink}
                                    alt={`From ${imageLink}`}
                                    src={`${props.apiURL}:5001/media/thumbnails/${imageLink}`}
                                    onClick ={() => props.handleSelectedImage(imageLink)}
                                />
                            </div>
                            )}
                    </div>})}
                </div>
            </div>
        );
}

export default ImageRenderWithHooks;