
/**
 * A parallel implementation of DTW
 * 
 * @param {*} xpoints 
 * @param {*} ypoints 
 * @param {*} isSubSequence 
 * 
 * @returns {float} Cost (Start by just computing the cost,     
 *                      and compare to lower right element in accumulated cost for full DTW)
 */
function matchPointsParallel(xpoints, ypoints, isSubSequence, debugging) {
    if (debugging === undefined) {
        debugging = true;
    }
    //There are N+M-1 diagonals
    //The max length of a diagonal is the minimum of M and N

    // STEP 0: (For Debugging) Fill in table to hold results
    let accumulatedDists = [];
    let distances = []; // Euclidean distances (for debugging)
    if (debugging) {
        for (let i = 0; i < xpoints.length; i++) {
            accumulatedDists.push([]);
            distances.push([]);
            for (let j = 0; j < ypoints.length; j++) {
                accumulatedDists[i].push(0);
                distances[i].push(0);
            }
        }
    }

    //STEP 1: Initialize k = 0 and k = 1, i.e. points (0,0), (0,1), and (1,0).
    let d0 = [];
    let d1 = [];
    let d2 = [];    //allocate enough memory for min(M,N)
    let xValue = 0;
    let yValue = 1;

    let leftCost = 0;
    let diagCost = 0;
    let upCost = 0;


    //these are always set correctly, phew

    //point (0,0)
    d0.push(computeDistance(xpoints[0],ypoints[0]));
    //point (1,0)
    d1.push(computeDistance(xpoints[1],ypoints[0]) + d0[0]);
    //point(0,1)
    d1.push(computeDistance(xpoints[0],ypoints[1]) + d0[0]);

    if (debugging) {
        accumulatedDists[0][0] = d0[0];
        accumulatedDists[1][0] = d1[0];
        accumulatedDists[0][1] = d1[1];
        distances[0][0] = d0[0];
        distances[1][0] = d1[0] - d0[0];
        distances[0][1] = d1[1] - d0[0];
    }

    //STEP 2: Start computing the next diagonals based on the ones before
        //d0, d1, and d2 will hold the relevant diagonal data
        //for k=2 to N+M-2{
    let starti = 2;
    let startj = 0;
    for (let k = 2; k < ((xpoints.length + ypoints.length)-1); k++) {
        //par for l = 0 to min(M,N){ -- can be a regular for loop for now
        let i = starti;
        let j = startj;
        let l = 0;
        do {
            leftCost = Infinity;
            upCost = Infinity;
            diagCost = Infinity;
            //somehow these are messing up again and I'm just not seeing it
            //-------------------------CORNER CASES--------------------------
            if(startj == 0){
                //left if it exists will be d1[l-1]
                if(l >= 1){
                    leftCost = d1[l-1];
                }
                //this one might work?
                //diag if it exists d0[l-1]
                if(l >= 1 && i > 0){
                    diagCost = d0[l-1];
                }
                //up if it exists d1[l]
                if(i > 0){
                    upCost = d1[l];
                }
            }

            if(starti == (xpoints.length - 1) && startj == 1){
                leftCost = d1[l];
                //up and diag if they exist
                if(i>0){
                    diagCost = d0[l];
                    upCost = d1[l+1];
                }
            }

            if(starti == (xpoints.length - 1) && startj > 1){
                leftCost = d1[l];
                if (i > 0) {
                    diagCost = d0[l+1];
                    upCost = d1[l+1];
                }
            }

            //optimal path cost
            let optCost = Math.min(leftCost,diagCost,upCost);

            //-- C[i,j] = ||Xi-Yj|| using computeDistance
            cost = computeDistance(xpoints[i],ypoints[j]);

            
            //accumulated distance
            d2[l] =  optCost + cost;

            if (debugging) {
                distances[i][j] = cost;
                accumulatedDists[i][j] = d2[l];
            }
            
            //keeping track of i and j by adding all the way down the column then across the row

            i -= 1;
            j += 1;
            l += 1;
        }
        while (i >= 0 && j < ypoints.length);
        //once i hits the end of the column, go across the row
        if(starti == xpoints.length - 1){
            startj++;
        }else{
            starti++;
        }

        d0 = d1;
        d1 = d2;
        d2 = [];
        //d2 will be rewritten next time around
    }

    //STEP 3: return the full table to compare
    // NOTE: Matches is empty for now
    return {'accumulatedDists':accumulatedDists, 'distances':distances, 'cost':d2[0], 'matches':[]};
}

/**
 * This function will compute all of the matchings by creating the distance arrays and 
 * doing the backtracing of optimal matchings between points. Can be a sub-sequence or
 * normal DTW.
 * 
 * @param {num} xpoints     list of points on Line X
 * @param {num} ypoints     list of points on Line Y
 * @param {boolean} isSubSequence true if subsequence procedure, false if normal DTW
 * 
 * @returns matches -- the list of matched points
 */
function matchPoints(xpoints, ypoints, isSubSequence){
    let i = 0;
    let j = 0;
    var xValue = 0;
    var yValue = 1;

    //creating a 2d array to hold the matching and distances
    var distances = [];
    var matches = [];	
    var accumulatedDists = [];

    //allocating memory for accumulatedDists and populating the regular dists
    for (i = 0; i < xpoints.length; i++){
        distances.push([]);
        accumulatedDists.push([]);
        
        for (j = 0; j < ypoints.length; j++){

            //getting the euclidean distance for the table
            distances[i][j] = computeDistance(xpoints[i], ypoints[j]);
            
            //allocating memory for accumulated distance table
            accumulatedDists[i].push(0);
        }
    } 	

    //----------------------FILLING ACCUMULATED DISTANCE TABLE---------------------

    //the very first element
    accumulatedDists[0][0] = (distances[0][0]);

    //if sub sequence, set the first row as straight dists, if not, accumulated
    if(isSubSequence){
        //fill first row as straight distances for sub sequence
        for (j = 1; j <= ypoints.length - 1; j++){
            accumulatedDists[0][j] = distances[0][j];
        }
    }else{
        //fill first row as accumulated for non sub sequence
        for(j = 1; j <= ypoints.length -1; j++){
            accumulatedDists[0][j] = (distances[0][j] + accumulatedDists[0][j-1]);
        }
    }

    //fill first col
    for(i = 1; i <= xpoints.length -1; i++){
        accumulatedDists[i][0] = (distances[i][0] + accumulatedDists[i-1][0]);
    }

    //fill the rest of the accumulated cost array
    for(i = 1; i <= xpoints.length -1; i++){
        for(j = 1; j <= ypoints.length -1; j++){
            
            //the total distance will come from the minimum of the three options added to the distance
            accumulatedDists[i][j] = (Math.min(accumulatedDists[i-1][j-1], accumulatedDists[i-1][j], 
                                                accumulatedDists[i][j-1]) + distances[i][j]);
            
        }
    }

    //-------------------------SETTING UP BACKTRACING----------------------------

    //setting the looping variables based on sub sequence or non
    if(isSubSequence){
        //subSequence starts at the minimum element on the bottom row, not necessarily the last
        let minimumVal = accumulatedDists[xpoints.length-1][0]; //holds the value
        let minimumCol = 0;            //holds the coordinates

        //finding the minimum
        for(let col = 1; col < ypoints.length; col++){
            //if the current distance is less than the minimum so far
            if(accumulatedDists[xpoints.length-1][col] < minimumVal){
                //minimum is found and is stored in a variable
                minimumVal = accumulatedDists[xpoints.length-1][col];
                minimumCol = col;
            }
        }

        //starts the match list at the minimum
        matches.push([xpoints.length-1, minimumCol]);

        //setting the loop boundaries
        i = xpoints.length - 1;
        j = minimumCol;
    }else{
        //starting at the end of the table
        i = xpoints.length - 1;
        j = ypoints.length - 1;

        //the last element in the table is where we start backtracing for the non-subSequence
        matches.push([xpoints.length-1,ypoints.length-1]);
    }

    //--------------------------------------BACKTRACING-----------------------------------------
        do{
            //if i == 0, and it is not a subsequence, continue left along the row
            if(i == 0 && !isSubSequence){
                j--;

            //if j == 0 continue up the column
            }else if (j == 0){
                i --;

            //i != 0  and j != 0
            }else{
                //if the next row over is the min, go to the next row over
                if(accumulatedDists[i-1][j] == Math.min(accumulatedDists[i-1][j-1], accumulatedDists[i-1][j], accumulatedDists[i][j-1])){
                    i--;

                //if the next column over is the min, go to the next col
                }else if (accumulatedDists[i][j-1] == Math.min(accumulatedDists[i-1][j-1], accumulatedDists[i-1][j],accumulatedDists[i][j-1])){
                    j--;

                //if neither of those are true, then it must be the diagonal, so we decrease i and j
                }else{
                    i--;
                    j--;
                }
            }

            //adding to the match list
            matches.push([i,j]);

        //while we're not at the top row, and for non-subSequence we are not at the first element
        }while(i>0 || (j>0 && !isSubSequence))    

    //return the match list instead of calling the drawing
    return {'matches':matches, 'accumulatedDists':accumulatedDists, 'distances':distances};
}

/**
 * This function computes the euclidean distance between the two points passed in.
 * 
 * ex.
 *   point A = (x1,y1)
 *   point B = (x2,y2)
 * @param {num} x1 x-coordinate one
 * @param {num} y1 y-coordinate one
 * @param {num} x2 x-coordinate two
 * @param {num} y2 y-coordinate two 
 * 
 * @returns the euclidean distance 
 */
function computeDistance(point1, point2){
    let x1 = point1[0];
    let y1 = point1[1];
    let x2 = point2[0];
    let y2 = point2[1];

    //calculate the distance between the two points using euclidean distance
    //||d|| = √( (x1 – y1)^2 + (x2 - y2)^2 )
    var distance = Math.sqrt( Math.pow( (x1 - x2), 2) + Math.pow( (y1 - y2), 2) );

    return distance;
}