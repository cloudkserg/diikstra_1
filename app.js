// Класс для описания точек на карте
class Point {
    //конструктор точки - сохраняет две координаты
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }

    //Создаем тчоку из строки
    static fromKey(key) {
        //получаем координаты разделяя ключ через подчеркивание и беря первую координату как икс, втору как игрек
        const [x, y] = key.split('_');
        return new Point(x, y);
    }

    //Получаем строку точки (для использования как ключа в массиве)
    //строка = x _ y
    getKey() {
        return this.x + '_' + this.y;
    }
}
//Класс для создания ячейки
class Cell {
    //Констуктор сохраняет вес и координаты точки
    constructor(x, y, weight) {
        this.x = x;
        this.y = y;
        this.weight = weight;
        //свойство говорящее в текущем пути находится точка или нет
        this.isPath = false;
        this.pathWeight = '*';
    }

    //Если надо из веса точки получить точку
    getPoint() {
        return new Point(this.x, this.y);
    }

    getKey() {
        return this.getPoint().getKey();
    }
}
//Класс для описания строки в таблице
class Row {
    //Конструктор класса
    //Сохраняет переменную и изначально имеет ноль ячеек (cells)
    constructor (y) {
        this.cells = [];
        this.y = y;
    }
    //получить последнюю координату Х для вставки или удаления ячейки из строки
    lastX() {
        return this.cells.length;
    }
    //Добавляем ячейку с весом по умолчанию 0
    addCell (weight = 0) {
        //Создаем ячейку как класс Cell
        //с координатами - y = y строки и x = последнему известному икс строки
        const newCell = new Cell(this.lastX(), this.y, weight);
        //сохраняем новую ячейку в строку
        this.cells.push(newCell);
    }
    /**
     * Удаляем ячейку последнюю из строки
     */
    removeCell() {
        this.cells.splice(-1, 1);
    }
}

//Класс для создания графика на рисунку
class Graph {
    constructor() {
        this.rows = [];
    }
    lastY() {
        return this.rows.length;
    }
    addRow(weights) {
        const row = new Row(this.lastY());
        weights.forEach(weight => row.addCell(weight));
        this.rows.push(row);
    }

    //функция для поиска соотвествующей ячейки по точке
    findCell(point) {
        return this.getCells().find(cell => cell.x == point.x && cell.y == point.y);
    }

    //Вернуть только ячейки графика
    getCells() {
        return _.flatMap(this.rows, row => row.cells);
    }

    //Функция для поиска соседей переданной точки
    //возвращает соседей в формате {x_y => weight, x_y => wegith,...}
    getNeighbors (point) {
        //Возможные соседи - либо сверху, либо снизу
        const availPoints = [
            new Point(point.x-1, point.y),
            new Point(point.x+1, point.y),
            new Point(point.x, point.y-1),
            new Point(point.x, point.y+1),
        ];
        //если находим такую тчоку на графике
        return availPoints
            //преобразуем точки в ячейки
            .map(point =>this.findCell(point))
            //фильтруем ненайденые
            .filter(cell => !!cell)
            //собираем из них соседей, как массив {x_y => weight, x_y => weight, ....}
            .reduce((neighborsObject,cell) => {
                neighborsObject[cell.getKey()] = cell.weight;
                return neighborsObject;
            }, {});
    }

    //чистим предыдущий путь удаляя все вершины из пути
    clearPath() {
        this.getCells().map(cell => cell.isPath = false);
    }

    setPath(pathPoints) {
        //обходим все точки
        pathPoints.forEach(pathPoint => {
            //если находим для нее ячейку
            const cell = this.findCell(pathPoint);
            if (cell) {
                //задаем свойство = true
                cell.isPath = true;
            }
        });
    }

    removeRow() {
        this.rows.splice(-1, 1);
    }
}

//Задаем начальную карту
const graph = new Graph();
//добавляем строку с несколькими точками с весами в порядке что указаны
graph.addRow([1, 2, 1, 5]);
//добавляем строку с несколькими точками с весами в порядке что указаны
graph.addRow([1, 20, 1, 90]);
// //добавляем строку с несколькими точками с весами в порядке что указаны
graph.addRow([20, 1, 1, 1]);
//добавляем строку с несколькими точками с весами в порядке что указаны
graph.addRow([1, 5, 1, 5]);
//добавляем строку с несколькими точками с весами в порядке что указаны
graph.addRow([20, 1, 5, 1]);

//Создаем приложение
new Vue({
    el: '#app',
    data: {
        //По умолчанию ищем путь из точки с ноль, ноль
        startPoint: new Point(0, 0),
        //Ищем путь по умолчанию к тчоке 3,2
        endPoint: new Point(3, 2),
        //наш граф храним тут
        graph: graph
    },
    methods: {

        //функция которая находит правильный путь из вершины start в вершину end
        //возвращает как набор точке от одной к другой (набор координат)
        //[Point(0,1), Point(1,1)]
        findMoreRightPath(dijkstra) {

            //Все ячейки заносим в этот класс
            this.graph.getCells().forEach(cell => {
                //Каждую ячейку заносим как ее ключ и ключи всех ее соседей с весом
               dijkstra.addNode(cell.getKey(), this.graph.getNeighbors(cell));
            });

            //получаем ключи путей с наименьшим весом от start к end
            const pathKeys = dijkstra.path(this.startPoint.getKey(), this.endPoint.getKey());
            //Возвращаем их как набор точек
            return pathKeys.map(pathKey => Point.fromKey(pathKey));
        },

        // что делаем при нажатии на кнопку
        calcSubmit() {
            //создаем класс для поиска пути
            const dijkstra = new Dijsktra();
            //сначала чистим предыдущий путь
            this.graph.clearPath();
            //потом находим точки нового пути
            const pathPoints = this.findMoreRightPath(dijkstra);
            Object.keys(dijkstra.weights).forEach(node => {
               const point = Point.fromKey(node);
               const cell = this.graph.findCell(point);
               cell.pathWeight = dijkstra.weights[node].minWeight;
            });
            //затем задаем только в них значение path = true
            this.graph.setPath(pathPoints);

// create an array with nodes
            var nodes = new vis.DataSet(
                _.chain(dijkstra.nodes)
                .map((node, key) => {
                    const [x,y]  = key.split('_');
                    return {id: key, label: `${x},${y}`};
                })
                .sort((node) => {
                    const [x1, y1] = node.id.split('_');
                    return parseInt(y1)*10 + parseInt(x1);
                })
                .reverse()
                .value()
            );

            var edges = new vis.DataSet(
                _.chain(dijkstra.nodes)
                .map((childs, key) =>
                    _.map(childs, (childWeight, childKey) => ({
                        from: childKey,
                        label: '' + childWeight,
                        font: {
                            align: "middle"
                        },
                        to: key
                    }))
                )
                .flatten()
                .map(node=> {
                    if (_.find(pathPoints, point => `${point.x}_${point.y}` == node.from) == null) {
                        return node;
                    }
                    if (_.find(pathPoints, point => `${point.x}_${point.y}` == node.to) == null) {
                        return node;
                    }
                    return _.merge(node, {
                        background: {
                            enabled: true,
                            color: "#ffff00"
                        }
                    });
                })
                .uniqWith((node1, node2) =>
                    (node1.from == node2.from && node1.to == node2.to) ||
                    (node1.from == node2.to && node1.to == node2.from)
                ).value()
            );

// create a network
            var container = document.getElementById("mynetwork");
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
            };
            var network = new vis.Network(container, data, options);

        },

        //при нажатии на кнопку добавить ячейку срабатывает эта функция
        addCell(row) {
            row.addCell();
        },
        //при нажатии на кнопку удалить ячейку срабатывает эта функция
        removeCell(row) {
          row.removeCell();
        },

        //при нажатии на кнопку добавить строку срабатывает эта функция
        addRow() {
            this.graph.addRow([0]);
        },

        //при нажатии на кнопку удалить строку срабатывает эта функция
        removeRow() {
            this.graph.removeRow();
        }
    },
});
