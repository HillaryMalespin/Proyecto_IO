
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None # hijo izquierdo
        self.right = None # hijo derecho

class ABB:
    def __init__(self, llaves):
        self.nodes, self.probabilities, self.keys = self.normalizar(llaves)
        self.root = None
        # matriz m x m+1 ; donde 'm' = # nodos
        # se agrega una fila mas porque si k = j, A[k+1][j] da Index Out Of Bounds
        self.tableP = [[None for _ in range(self.nodes+1)] for _ in range(self.nodes+2)]
        self.tableR = [row.copy() for row in self.tableP]
        # si fuera a hacerse una implementacion con una gran cantidad de nodos
        # vale la pena pensar en una implementacion con un prefix sum para mejorar el rendimiento

    def normalizar(self, llaves):
        # se recibe "llaves"; es una lista de pares (llave, peso), en cualquier orden
        # aca se ordenan lexicograficamente y se calculan las probabilidades
        llaves = sorted(llaves, key=lambda par: par[0])
        keys = [nombre for nombre, peso in llaves]
        pesos = [peso for nombre, peso in llaves]
        total = sum(pesos)
        probabilities = [p / total for p in pesos]
        nodes = len(keys)
        return nodes, probabilities, keys

    def printPTable(self):
        print("Tabla P:")
        for row in self.tableP:
            print("[", *row, "]")
        print("\n")

    def printRTable(self):
        print("Tabla R:")
        for row in self.tableR:
            print("[", *row, "]")
        print("\n")

    def calculateTables(self):
        # primero los casos triviales
        # - A[i][i-1] = 0
        # - A[i][i] = Pi
        # - R[i][i] = i
        for i in range(1,self.nodes+1):
            self.tableP[i][i-1] = 0.0000
            self.tableP[i][i] = self.probabilities[i-1]
            self.tableR[i][i] = i
        self.tableP[self.nodes+1][self.nodes] = 0.0000
        # A[i][j] = min[ (A[i][k-1] + A[k+1][j] + sum(probabilities) for k in range(i,j) ]
        # for i in range(1, self.nodes+1):
        #     for j in range(i+1, self.nodes+1):
        #         best_candidate = [-1,-1]
        #         sum_probabilities = sum(self.probabilities[i-1:j])
        #         for k in range(i, j+1):
        #             cost = self.tableP[i][k-1] + self.tableP[k+1][j] + sum_probabilities
        #             if (best_candidate[1] > cost):
        #                 best_candidate[0] = k
        #                 best_candidate[1] = cost
        #             # si hay empate, se escoge el menor 'k', sin embargo si se
        #             # recorre en orden, un 'k' nunca va a ser menor que el anterior
        for diff in range(1,self.nodes):
            for i in range(1,self.nodes+1-diff):
                j = i+diff
                best_candidate = [-1,-1]
                sum_probabilities = sum(self.probabilities[i-1:j])
                for k in range(i,j+1):
                    cost = round(self.tableP[i][k-1] + self.tableP[k+1][j] + sum_probabilities, 4)
                    if (best_candidate[1] > cost or best_candidate[1] == -1):
                        best_candidate = [k,cost]
                self.tableP[i][j] = best_candidate[1]
                self.tableR[i][j] = best_candidate[0]

def resolver_abb(llaves):
    abb = ABB(llaves)
    abb.calculateTables()
    abb.printPTable()
    abb.printRTable()
    return {
        "keys": abb.keys,
        "probabilities": abb.probabilities,
        "tableP": abb.tableP,
        "tableR": abb.tableR
    }

if __name__ == '__main__':
    abb = ABB([(1, 0.30), (2, 0.38), (3, 0.09), (4, 0.09), (5, 0.14)])
    abb.calculateTables()
    abb.printPTable()
    abb.printRTable()
    # nodes = 5
    # for dif in range(1,nodes):
    #     print(f"diferencia de:{dif}")
    #     for x in range(1, nodes+1-dif):
    #         row = x
    #         column = x+dif
    #         print(f"[{row}][{column}]")