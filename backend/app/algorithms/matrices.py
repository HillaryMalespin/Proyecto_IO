SUBINDICES = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")


def nombre(i):
    # 1 -> "A₁", 10 -> "A₁₀"
    return "A" + str(i).translate(SUBINDICES)


class Node:
    def __init__(self, value):
        self.value = value
        self.left = None  # sub-cadena izquierda
        self.right = None  # sub-cadena derecha


class Matrices:
    def __init__(self, dimensiones):
        # dimensiones = [d0, d1, ..., dn]  ->  la matriz Ai es de tamaño d(i-1) x d(i)
        self.dims = list(dimensiones)
        self.n = len(self.dims) - 1  # numero de matrices
        self.root = None
        # tablas (n+1) x (n+1), indexadas desde 1 igual que en OBST
        # fila 0 y columna 0 no se usan
        self.tableM = [[None for _ in range(self.n + 1)] for _ in range(self.n + 1)]
        self.tableP = [row.copy() for row in self.tableM]

    def printMTable(self):
        print("Tabla M:")
        for row in self.tableM:
            print("[", *row, "]")
        print("\n")

    def printPTable(self):
        print("Tabla P:")
        for row in self.tableP:
            print("[", *row, "]")
        print("\n")

    def calculateTables(self):
        # caso trivial: multiplicar una sola matriz cuesta 0
        for i in range(1, self.n + 1):
            self.tableM[i][i] = 0

        # M[i][j] = min( M[i][k] + M[k+1][j] + d(i-1) * d(k) * d(j) )  para k en [i, j)
        # se recorre por diagonales (diff = j - i), igual que en OBST
        for diff in range(1, self.n):
            for i in range(1, self.n + 1 - diff):
                j = i + diff
                best_candidate = [-1, -1]
                for k in range(i, j):
                    cost = (
                        self.tableM[i][k]
                        + self.tableM[k + 1][j]
                        + self.dims[i - 1] * self.dims[k] * self.dims[j]
                    )
                    # empate -> se queda el menor 'k' (el primero encontrado)
                    if best_candidate[1] == -1 or cost < best_candidate[1]:
                        best_candidate = [k, cost]
                self.tableM[i][j] = best_candidate[1]
                self.tableP[i][j] = best_candidate[0]

    def getParenthesization(self, i, j):
        # formato del enunciado: ((A₁ (A₂ A₃)) A₄)
        if i == j:
            return nombre(i)
        k = self.tableP[i][j]
        return "(" + self.getParenthesization(i, k) + " " + self.getParenthesization(k + 1, j) + ")"

    def getNode(self, i, j):
        # hoja = una matriz; nodo interno = el producto de la sub-cadena Ai..Aj
        if i == j:
            return Node(nombre(i))
        k = self.tableP[i][j]
        root = Node(f"{nombre(i)}..{nombre(j)}")
        root.left = self.getNode(i, k)
        root.right = self.getNode(k + 1, j)
        return root

    def createTree(self):
        self.root = self.getNode(1, self.n)

    # mismo formato que OBST -> el frontend puede reutilizar el componente del arbol
    def serializeTree(self):
        def serialize_node(node):
            if node is None:
                return None
            return {
                "value": node.value,
                "left": serialize_node(node.left),
                "right": serialize_node(node.right),
            }
        return serialize_node(self.root)


def resolver_matrices(dimensiones):
    mat = Matrices(dimensiones)
    mat.calculateTables()
    mat.createTree()
    return {
        "dimensiones": mat.dims,
        "n": mat.n,
        "tableM": mat.tableM,
        "tableP": mat.tableP,
        "parentizacion": mat.getParenthesization(1, mat.n),
        "costo": mat.tableM[1][mat.n],
        "tree": mat.serializeTree(),
    }


if __name__ == "__main__":
    mat = Matrices([10, 20, 30, 40])
    mat.calculateTables()
    mat.printMTable()
    mat.printPTable()
    print(resolver_matrices([30, 35, 15, 5, 10])["parentizacion"])  # ((A₁ (A₂ A₃)) A₄)