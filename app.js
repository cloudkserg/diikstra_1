class Point {
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }

    static fromKey(key) {
        const [x, y] = key.split('_');
        return new Point(x, y);
    }

    getKey() {
        return this.x + '_' + this.y;
    }
}
class Row {
    constructor (y) {
        this.cells = [];
        this.y = y;
    }
    lastX() {
        return this.cells.length;
    }
    addCell (weight = 0) {
        const newCell = new WeightPoint(this.lastX(), this.y, weight);
        this.cells.push(newCell);
    }
    /**
     *
     * @param row int[]
     */
    removeCell() {
        this.cells.splice(-1, 1);
    }

}
class WeightPoint {
    constructor(x, y, weight) {
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.isPath = false;
    }

    getPoint() {
        return new Point(this.x, this.y);
    }
}


const startRow = new Row(0);
startRow.addCell(1);
startRow.addCell(2);
const secondRow = new Row(1);
secondRow.addCell(1);
secondRow.addCell(2);
new Vue({
    el: '#app',
    data: {
        startPoint: new Point(0, 0),
        endPoint: new Point(1, 1),
        rows: [startRow, secondRow],
        result: ''
    },
    methods: {
        getNeighbors (point) {
            const availPoints = [
                new Point(point.x-1, point.y),
                new Point(point.x+1, point.y),
                new Point(point.x, point.y-1),
                new Point(point.x, point.y+1),
            ];
            return availPoints.map(availPoint => {
                return this.findCell(availPoint);
            })
            .filter(cell => !!cell)
            .reduce((neighborsObject,cell) => {
                neighborsObject[cell.getPoint().getKey()] = cell.weight;
                return neighborsObject;
            }, {});
        },
        findMoreRightPath(rows, startPoint, endPoint) {
            const dijkstra = new Dijsktra();
            rows.forEach(row => {
                row.cells.forEach(cell => {
                    const point = cell.getPoint();
                    dijkstra.addNode(point.getKey(), this.getNeighbors(point))
                });
            });
            const pathKeys = dijkstra.path(startPoint.getKey(), endPoint.getKey());
            console.log('PATH_KEYS', pathKeys);
            return pathKeys.map(pathKey => Point.fromKey(pathKey));
        },
        findCell(point) {
          let findedCell = null;
          this.rows.forEach(row => {
             row.cells.forEach(cell => {
                if (cell.x == point.x && cell.y == point.y) {
                    findedCell = cell;
                }
             });
          });
          return findedCell;
        },

        clearPathClassInPoints() {
            this.rows.map(row => {
                row.cells.map(cell => {
                    cell.isPath = false;
                });
            });
        },

        calcSubmit() {
            const pathPoints = this.findMoreRightPath(this.rows, this.startPoint, this.endPoint);
            this.clearPathClassInPoints();
            pathPoints.forEach(pathPoint => {
                const cell = this.findCell(pathPoint);
                if (!cell) {
                    throw new Error('Not found cell with x,y = ' + pathPoint.x +','+pathPoint.y)
                }
                cell.isPath = true;
            });
        },

        lastY() {
            return this.rows.length - 1;
        },

        addCell(row) {
            row.addCell();
        },
        removeCell(row) {
          row.removeCell();
        },

        addRow() {
            const row = new Row(this.lastY() + 1);
            this.rows.push(row);
            row.addCell();
        },
        removeRow() {
            this.rows.splice(-1, 1);
        }
    },
});
