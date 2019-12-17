//Класс для веса в пути (видно откуда и какой вес)
class WeightNode {
    //Конст
    constructor (minWeight, minPrevKey) {
        this.minWeight = minWeight;
        this.minPrevKey = minPrevKey;
    }
}
//класс для применения алгоритма
class Dijsktra
{
    //Конструктор класса
    constructor()
    {
        //Вершины с соседями {0_1 = [0_2, 1_0]], ...}
        this.nodes = {};
        //Веса для каждой из вершин {0_1 => [WightNode(0, null)], 1_0 => [WeightNode(1, 0_1)].. }
        this.weights = {};
        //Пройденные вершины
        this.passedNodes = [];
    }

    //Добаляем вершину как название и объект со соседями
    //объект с соседями = {a: 1, b: 2}
    addNode(name, neighbors)
    {
        this.nodes[name] = neighbors
    }

    //Первый шаг - начальная вершина  - у нее вес 0 и предыдущей вершины нет
    startStep(startKey) {
        this.weights[startKey] = new WeightNode(0, null);
        //выставляем веса всем соседям
        // как расстояния от текущей точки
        Object.keys(this.nodes[startKey]).forEach(node => {
            this.weights[node] = new WeightNode(this.nodes[startKey][node], startKey);
        })
    }




    //построение пути из start в end
    path (startKey, endKey)
    {
        //по алгоритму рассчитываем веса всех вершин
        this.calcWeights(startKey);
        console.log('neighbors', this.nodes);
        //Строим путь до начальной точки, идя с конечной
        const path = [endKey];
        let prevNodeKey = this.weights[endKey].minPrevKey;
        //потом идем в цикле пока не дойдем до начальной точки
        while (prevNodeKey !== null) {
            // на каждом этапе ложим вершину, которая указана предыдущей с минимальным весом для этой вершины
            path.push(prevNodeKey);
            prevNodeKey = this.weights[prevNodeKey].minPrevKey;
        }

        //возвращаем путь, отматывая его от начала
        return path.reverse();
    }

    // расчет всех весов всех вершин, вес относительно текущей стартовой точки
    calcWeights(startKey) {
        //Стартовый шаг
        this.startStep(startKey);
        this.calcOtherWeights(startKey);
    }

    getCurrentWeight(node) {
        if (!this.weights[node]) {
            return 90000000000000;
        }
        return this.weights[node].minWeight
    }

    //функция возвращает непосещенную минмиальну. вершину, наиболее ближайшую к текущей точке
     getNotPassedNeighborWithMinWeight(neighbors) {
        //ищем все непосещенных соседей текущей точки
        const notPassedNeighbors = neighbors
            .filter(neighbor => !this.passedNodes.includes(neighbor));
        //если такие есть, выбираем из них минимальный
        if (notPassedNeighbors.length > 0) {
            return _.minBy(notPassedNeighbors, neighbor => this.getCurrentWeight(neighbor));
        }
        //иначе ищем минимальный из всех соседей всех соседей текущей точки
        return this.getNotPassedNeighborWithMinWeight(
            _.flatten(
                Object.keys(this.nodes)
                .map(nodeKey =>
                   Object.keys(this.nodes[nodeKey])
                )
            )
        );
    }

    //функция для проверки минимальный ли это вес
    isMinWeight(node, weight) {
        if (!this.weights[node]) {
            return true;
        }
        return this.weights[node].minWeight > weight;
    }

    //рассчитываем веса остальных вершин
    calcOtherWeights(startKey)
    {
        // Если прошли все вершин, то выходим
        if (this.passedNodes.length === Object.keys(this.nodes).length) return;

        //выбираем минимальную точку из непосещенных
        const minNeighbor = this.getNotPassedNeighborWithMinWeight(Object.keys(this.nodes[startKey]));
        //его соседи
        const neighbors = this.nodes[minNeighbor];
        // выставим вес для каждого из его соседей
        Object.keys(neighbors).forEach(node =>
        {
            //Если вершина уже пройдена пропуска
            if (this.passedNodes.includes(node)) {
                return;
            }
            //вес соседа
            const neighborWeight = this.weights[minNeighbor].minWeight;
            //вес текущего расстояния до точки от соседа
            const lineWeight = this.nodes[minNeighbor][node];
            //Вес получаем как сумму веса текущей точке и веса соседа
            const weight = neighborWeight + parseInt(lineWeight);
            const prev = minNeighbor;
            console.log('CHECK WEIGHT', minNeighbor, node);

            //Найденный вес меньше текущего?
            if (this.isMinWeight(node, weight)) {
                //добавляем вес в веса  или изменяем его
                this.weights[node] = new WeightNode(weight, prev);
            }
        });
        //почемаем точку как прошедшую
        this.passedNodes.push(minNeighbor);
        console.log(this.passedNodes, minNeighbor);
        Object.keys(this.weights).forEach(node => {
            const point = Point.fromKey(node);
            const cell = graph.findCell(point);
            cell.pathWeight = this.weights[node].minWeight;
        });
        //повторяем по кругу
        //setTimeout( () => this.calcOtherWeights(startKey), 1000);
        this.calcOtherWeights(startKey);
    }
}
