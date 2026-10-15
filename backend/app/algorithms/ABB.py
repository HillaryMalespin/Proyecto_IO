
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None # hijo izquierdo
        self.right = None # hijo derecho

class ABB:
    def __init__(self, nodes):
        self.nodes = nodes
        self.root = None
        # matriz m x m ; donde 'm' = # nodos
        self.tableP = [[None for _ in range(nodes+1)] for _ in range(nodes+1)]
        self.tableR = [row.copy() for row in self.tableP]

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

    def calculatePTable(self):
        # primero los casos triviales
        # - A[i,i-1] = 0
        for i in range(1,self.nodes+1):
            self.tableP[i][i-1] = 0
        # - A[i,i] = Pi
        # A[i][j] = min[ (A[i][k-1] + A[k+1][j] + sum(probabilities) for k in range(i,j) ]

if __name__ == '__main__':
    abb = ABB(5)
    abb.printPTable()
    abb.printRTable()
    print("This is the abb.py module.")