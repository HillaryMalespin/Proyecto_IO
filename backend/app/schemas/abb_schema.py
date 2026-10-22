from pydantic import BaseModel

# el esquema que ABB espera es:
# lista de:
#     llave, peso

# {
#     "llaves": [
#         {"llave": "Praga", "peso":2023},
#         {"llave": "New York", "peso":8504},
#         {"llave": "San José", "peso":3100},
#         {"llave": "París", "peso":2025},
#         {"llave": "Atenas", "peso":6617}

#     ]
# }
class Llave(BaseModel):
    llave: str
    peso: int

class ProblemaABB(BaseModel):
    llaves: list[Llave]