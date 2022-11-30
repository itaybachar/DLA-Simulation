function Point(x, y) {
    this.x = x;
    this.y = y;
}

function getClosestPoints(r, unitSize) {
    //r: radius
    //unitSize: size of squares, test with 1 for now
    const quad1 = [];

    //get starting point
    var currentPoint = new Point(0, r);
    quad1.push(currentPoint);

    currentPoint = new Point(0 - unitSize, r - unitSize)
    var x = currentPoint.x;
    var y = currentPoint.y;
    var distance = Math.sqrt(x * x + y * y);

    //get top horizontal points
    while (distance <= r) {
        quad1.push(currentPoint);
        currentPoint = new Point(x - unitSize, y);

        x = currentPoint.x;
        y = currentPoint.y;
        distance = Math.sqrt(x * x + y * y);
    }

    //get diagonal points
    var count = 0;
    while (true) {
        if (distance > r && count == 0) {
            currentPoint = new Point(x, y - unitSize);
            x = currentPoint.x;
            y = currentPoint.y;
            distance = Math.sqrt(x * x + y * y);
            count = 1;
        } else if (distance > r && count == 1) {
            currentPoint = new Point(x + unitSize, y);
            x = currentPoint.x;
            y = currentPoint.y;
            distance = Math.sqrt(x * x + y * y);
            break;
        } else {
            count = 0;
            if ((r - distance) < unitSize) {
                quad1.push(currentPoint);
                currentPoint = new Point(x - unitSize, y);
                x = currentPoint.x;
                y = currentPoint.y;
                distance = Math.sqrt(x * x + y * y);
            }
            /*else {
                console.log("hello");
                currentPoint = new Point(x-unitSize,y);
                x = currentPoint.x;
                y = currentPoint.y;
                distance = Math.sqrt(x*x + y*y); 
            }*/
        }
    }
    //get vertical points
    while (y != 0) {
        quad1.push(currentPoint);

        currentPoint = new Point(-1 * r + 1, y - unitSize);
        x = currentPoint.x;
        y = currentPoint.y;
        distance = Math.sqrt(x * x + y * y);
    }
    //get last point
    currentPoint = new Point(-1 * r, 0);
    quad1.push(currentPoint);

    return quad1;

}

let maxRestarts = 50;

function walk(x, y, seed) {
    restartCount = 0;
    originalX = x;
    originalY = y;
    while (true) {
        //Break if stuck
        if (restartCount > maxRestarts)
            break;

        prevX = x;
        prevY = y;

        //move
        move = Math.random();
        if (0 <= move && move < 0.25) {
            x = x + 1;
        } else if (0.25 <= move && move < 0.5) {
            y = y - 1;
        } else if (0.5 <= move && move < 0.75) {
            x = x - 1;
        } else {
            y = y + 1;
        }

        //If outside bounds or walked onto existing growth, revert move.
        if (getDistance(seed.x, seed.y, x, y) > seed.grid.boundaryRadius || seed.has(x, y)) {
            x = prevX;
            y = prevY;
            restartCount++;
            continue;
        }



        //Build surrounding bitmap
        bitmap = getSurroundingBitmap(x, y, seed);

        //Check if near seed
        if (bitmap == 0) {
            continue;
        }

        //Check for holes
        // if (bitmap > 1 && hasHoles(x, y, bitmap, seed)) {
        //     console.log("Has Hole" + x + " " + y)
        //         // stroke(color("purple"));
        //         // point(x, y);
        //         // noLoop()
        //     restartCount++;
        //     continue;
        // }

        //Function for stick probability
        if (1) {
            //Add node to seed
            seed.add(x, y)
        }
    }
    return seed;
}

function getSurroundingBitmap(x, y, seed) {
    bitmap = 0;
    if (seed.has(x + 1, y))
        bitmap |= 0b0001;
    if (seed.has(x - 1, y))
        bitmap |= 0b0010;
    if (seed.has(x, y + 1))
        bitmap |= 0b0100;
    if (seed.has(x, y - 1))
        bitmap |= 0b1000;
    return bitmap;
}

function hasHoles(x, y, bitmap, seed) {
    //go around the point(3 by 3) and find all the "flips"
    deltax = [0, -1, -1, -1, 0, 1, 1, 1]
    deltay = [1, 1, 0, -1, -1, -1, 0, 1]

    flipCount = 0;
    prevCon = curCon = seed.has(x + deltax[0], y + deltay[0]);
    for (i = 1; i < 8; i++) {
        curCon = seed.has(x + deltax[i], y + deltay[i]);
        if (prevCon != curCon)
            flipCount++;
        prevCon = curCon;
    }
    //Get points around  potential stick in a clockwise manner
    return flipCount > 2;
}

function walkQuadrants(quad1, seed) {
    var move;
    var stuck;

    //quad3
    for (i = 0; i < quad1.length - 1; i++) {
        x = -1 * quad1[i].x;
        y = -1 * quad1[i].y;
        seed = walk(x, y, seed);
        // return;
    }
    //quad4
    for (i = quad1.length - 1; i > 0; i--) {
        x = -1 * quad1[i].x;
        y = quad1[i].y;
        seed = walk(x, y, seed);
    }
    //quad1
    for (i = 0; i < quad1.length - 1; i++) {
        x = quad1[i].x;
        y = quad1[i].y;
        seed = walk(x, y, seed);
    }
    //quad 2
    for (i = quad1.length - 1; i > 0; i--) {
        x = quad1[i].x;
        y = -1 * quad1[i].y;
        seed = walk(x, y, seed);
    }
}