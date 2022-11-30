let grid;
let seed;
let GRID_COUNT = 100;
let CELL_SIZE = 5;
let initialBoundary = 10;
let fr = 1;

let quadrentPoints;

function setup()
{
    frameRate(fr); // Attempt to refresh at starting FPS
    createCanvas(GRID_COUNT * CELL_SIZE, GRID_COUNT * CELL_SIZE);
    setupSimulation();
}

function setupSimulation()
{
    grid = new GridDomain(GRID_COUNT, width / GRID_COUNT, initialBoundary);

    seed = new Seed(0, 0, grid)
    seed.display();

    quadrentPoints = getClosestPoints(grid.boundaryRadius, 1);
    grid.display();
}

function draw()
{
    walkCircle();
}

function walkCircle()
{
    walkQuadrants(quadrentPoints, seed)
}

class GridDomain
{
    constructor(divisions, scale, boundaryRadius = 0)
    {
        this.rows = divisions;
        this.cols = divisions;
        this.scale = scale;
        this.boundaryRadius = boundaryRadius;
    }

    getOrigin()
    {
        return [this.cols / 2, this.rows / 2]
    }

    getOriginScreen()
    {
        return [this.cols * this.scale / 2, this.rows * this.scale / 2]
    }

    display()
    {
        for (var x = 0; x <= this.cols; x++)
        {
            for (var y = 0; y <= this.rows; y++)
            {
                stroke(color('grey'))
                strokeWeight(1);
                // stroke(1);
                line(x * this.scale, 0, x * this.scale, this.rows * this.scale);
                line(0, y * this.scale, this.cols * this.scale, y * this.scale);
            }
        }

        this.displayBoundary();
    }

    displayBoundary()
    {
        if (this.boundaryRadius > 0)
        {
            let origin = this.getOriginScreen();
            stroke(color("grey"))
            noFill();
            strokeWeight(1)
            circle(origin[0], origin[1], this.boundaryRadius * grid.scale * 2)
        }
    }
}

class Seed
{
    constructor(x, y, grid)
    {
        this.x = x;
        this.y = y;
        this.grid = grid;
        this.walkers = new TupleSet();
        this.walkers.add([x, y]);
        this.walkerWidth = 7;
    }

    // 1 - walker stuck!
    // 0 - no interaction, keep walking
    // -1 - walked ontop of growth, backtrack
    // 2 - outside of boundary, restart walker.
    stick(x, y)
    {
        //Is outside of bounds
        if (getDistance(this.x, this.y, x, y) > this.grid.boundaryRadius)
        {
            return 2;
        }

        //Is on seed/growth
        if (this.walkers.has([x, y]))
        {
            return -1;
        }

        //Check if its a possible stick point
        if (this.walkers.has([x + 1, y]) ||
            this.walkers.has([x, y + 1]) ||
            this.walkers.has([x - 1, y]) ||
            this.walkers.has([x, y - 1]))
        {

            let [edgeCount, diagonalCount] = getSurroundingNeighbors(x, y, seed);
            if (edgeCount > 0 && hasHoles(x, y, seed))
            {
                return 0;
            }

            //Has possible stick
            if (stuckToSeed())
            {
                let org = grid.getOrigin();
                this.walkers.add([x, y]);
                // console.log(getDistance(x, y, 0, 0))
                if (this.grid.boundaryRadius < GRID_COUNT / 2 &&
                    getDistance(x, y, 0, 0) >= 0.9 * this.grid.boundaryRadius)
                {
                    //Update Size
                    this.grid.boundaryRadius += 2;
                    quadrentPoints = getClosestPoints(this.grid.boundaryRadius, 1);

                    clear();
                    this.grid.displayBoundary();
                    this.display();
                }

                //Restart Simulation
                if (getDistance(this.x, this.y, x, y) >= this.grid.boundaryRadius * .98)
                {
                    // setupSimulation();
                    noLoop();
                }

                stroke("green")
                strokeWeight(CELL_SIZE);
                point((x + org[0]) * this.grid.scale, (-y + org[1]) * this.grid.scale)
                return 1;
            } else
            {
                return -1;
            }
        }

        //No where to stick to or did not stick
        return 0;
    }

    add(x, y)
    {
        let org = grid.getOrigin();
        this.walkers.add([x, y]);
        // console.log(getDistance(x, y, 0, 0))
        if (this.grid.boundaryRadius < GRID_COUNT / 2 &&
            getDistance(x, y, 0, 0) >= 0.9 * this.grid.boundaryRadius)
        {
            //Update Size
            this.grid.boundaryRadius += 2;
            quadrentPoints = getClosestPoints(this.grid.boundaryRadius, 1);

            clear();
            this.grid.displayBoundary();
            this.display();
        }

        //Restart Simulation
        if (getDistance(this.x, this.y, x, y) >= this.grid.boundaryRadius * .98)
        {
            // setupSimulation();
            noLoop();
        }

        stroke("green")
        strokeWeight(CELL_SIZE);
        point((x + org[0]) * this.grid.scale, (-y + org[1]) * this.grid.scale)
    }

    display()
    {
        let org = grid.getOrigin();
        this.walkers.data.forEach((ys, x) =>
        {
            ys.forEach(y =>
            {
                if (x == this.x && y == this.y)
                    stroke("red");
                else
                    stroke("green")

                strokeWeight(CELL_SIZE);
                point((x + org[0]) * this.grid.scale, (-y + org[1]) * this.grid.scale)
            })
        });
    }

    has(x, y)
    {
        return this.walkers.has([x, y])
    }
}

function getDistance(x1, y1, x2, y2)
{
    return Math.hypot(x2 - x1, y2 - y1);
}

function stuckToSeed()
{
    return true;
}