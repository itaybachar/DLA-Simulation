function Point(x, y)
{
    this.x = x;
    this.y = y;
}

function getClosestPoints(r, unitSize)
{
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
    while (distance <= r)
    {
        quad1.push(currentPoint);
        currentPoint = new Point(x - unitSize, y);

        x = currentPoint.x;
        y = currentPoint.y;
        distance = Math.sqrt(x * x + y * y);
    }

    //get diagonal points
    var count = 0;
    while (true)
    {
        if (distance > r && count == 0)
        {
            currentPoint = new Point(x, y - unitSize);
            x = currentPoint.x;
            y = currentPoint.y;
            distance = Math.sqrt(x * x + y * y);
            count = 1;
        } else if (distance > r && count == 1)
        {
            currentPoint = new Point(x + unitSize, y);
            x = currentPoint.x;
            y = currentPoint.y;
            distance = Math.sqrt(x * x + y * y);
            break;
        } else
        {
            count = 0;
            if ((r - distance) < unitSize)
            {
                quad1.push(currentPoint);
                currentPoint = new Point(x - unitSize, y);
                x = currentPoint.x;
                y = currentPoint.y;
                distance = Math.sqrt(x * x + y * y);
            }
        }
    }
    //get vertical points
    while (y != 0)
    {
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

function walk(x, y, seed)
{
    restartCount = 0;
    originalX = x;
    originalY = y;
    while (true)
    {
        //Break if stuck
        if (restartCount > maxRestarts)
            break;

        prevX = x;
        prevY = y;

        //move
        move = Math.random();
        if (0 <= move && move < 0.25)
        {
            x = x + 1;
        } else if (0.25 <= move && move < 0.5)
        {
            y = y - 1;
        } else if (0.5 <= move && move < 0.75)
        {
            x = x - 1;
        } else
        {
            y = y + 1;
        }

        stickOutput = seed.stick(x, y)

        if (stickOutput == 2)
        {
            x = originalX;
            y = originalY;
            restartCount++;
            continue;
        } else if (stickOutput == -1)
        {
            x = prevX;
            y = prevY;
            restartCount++;
        } else if (stickOutput == 1)
        {
            break;
        }
    }
}

function getSurroundingNeighbors(x, y, seed)
{
    edge = 0;
    diagonal = 0;
    if (seed.has(x + 1, y))
        edge++;
    // bitmap |= 0b0001;
    if (seed.has(x - 1, y))
        edge++;
    // bitmap |= 0b0010;
    if (seed.has(x, y + 1))
        edge++;
    // bitmap |= 0b0100;
    if (seed.has(x, y - 1))
        edge++;
    // // bitmap |= 0b1000;
    // if (seed.has(x + 1, y + 1))
    //     diagonal++;
    // if (seed.has(x - 1, y + 1))
    //     diagonal++
    // if (seed.has(x - 1, y - 1))
    //     diagonal++
    // if (seed.has(x + 1, y - 1))
    //     diagonal++;
    //Diagonals
    return [edge, diagonal];
}

function hasHoles(x, y, seed)
{
    //go around the point(3 by 3) and find all the "flips"
    deltax = [0, -1, -1, -1, 0, 1, 1, 1]
    deltay = [1, 1, 0, -1, -1, -1, 0, 1]

    flipCount = 0;
    prevCon = curCon = seed.has(x + 1, y + 1);
    for (let index = 0; index < 8; index++)
    {
        curCon = seed.has(x + deltax[index], y + deltay[index]);
        if (prevCon != curCon)
        {
            flipCount++;
        }
        prevCon = curCon;
    }
    //Get points around  potential stick in a clockwise manner
    return flipCount > 3;
}

function walkQuadrants(quad1, seed)
{
    var move;
    var stuck;

    //quad3
    for (i = 0; i < quad1.length - 1; i++)
    {
        x = -1 * quad1[i].x;
        y = -1 * quad1[i].y;
        walk(x, y, seed);
        // return;
    }
    //quad4
    for (i = quad1.length - 1; i > 0; i--)
    {
        x = -1 * quad1[i].x;
        y = quad1[i].y;
        walk(x, y, seed);
    }
    //quad1
    for (i = 0; i < quad1.length - 1; i++)
    {
        x = quad1[i].x;
        y = quad1[i].y;
        walk(x, y, seed);
    }
    //quad 2
    for (i = quad1.length - 1; i > 0; i--)
    {
        x = quad1[i].x;
        y = -1 * quad1[i].y;
        walk(x, y, seed);
    }
}

function FindProb(seed, x, y, A, B, L)
{
    var Ni = 0;
    for (var i = x - 4; i <= x + 4; i++)
    {
        for (var j = y - 4; j <= y + 4; j++)
        {
            if (seed.walkers.has([x + 1, y]))
                Ni += 1;
        }
    }
    var C = .01;
    var prob = A * (Ni / L / L - (L - 1) / 2 / L) + B; //probability of sticking based on number of 1s inside box
    if (prob < C)
    { //if the probability happens to be negative (small curvature) 
        // set p=C so the code doesnt get stuck
        prob = C; //to get negatives, you need to make A and B different than 1 and 0.5
    }
    return prob;
}
