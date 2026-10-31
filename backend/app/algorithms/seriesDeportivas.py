import math



#tabla es la tabla
#inicioLocalidad es 1 o 0 donde uno significa que se empieza como host
def asignarLocalidad(tabla, inicioLocalidad, ordenLocalidad,tamanyo):
    
    hostActual=inicioLocalidad #lleva registro de si poner visitante o host
    cambios=0 # lleva registro de la posicion en el arreglo del orden de localidad
    juegosRestantes=ordenLocalidad[0] #cuenta regresiva de cuantos juegos faltan antes del cambio

    #Esto calcula valores de manera que al sumarle 3 al i se tiene
    # al inicio los enteros de -3 a 0, y conforme sube se tienen los enteros 0-6
    # Cabe destacar que esto es para lograr el patron de coordenadas de casillas que
    # en cada iteracion forman rayas diagonales, en este caso usando 3 como tamanyo
    # de la tabla descartando las filas constantes 3 y 4
    for i in range(1-tamanyo,tamanyo): 
        #print("Corrida "+str(i+1))
        #print("   hostActual: "+str(hostActual))
        #print("   cambios: "+str(cambios))
        #print("   juegosRestantes: "+str(juegosRestantes))
        #print("")
        
    
        if i<0: a=0 #si el minimo es menor que 0, subalo a 0 para no tocar las
        else: a=i   #coordenadas negativas
        
        if (i+tamanyo-1)>(tamanyo-1): b=tamanyo-1 #si el maximo es mayor que 3, bajelo a 3 para no tocar las
        else: b=(i+tamanyo-1)   #coordenadas de 4 en adelante

        #print("   Cambios en la tabla:")
        for j in range(a,b+1): #para cada numero en el rango entre a y b, osea cada casilla diagonal
            #print("a="+str(a)+", b="+str(b))
            #print("      casilla ("+str(j)+", "+str(b-j+a)+") configurada en "+str(hostActual))
            tabla[j][b-j+a]=hostActual  #actualize las casillas que tienen
                                        # coordenadas (j,j'), osea diagonales como
                                        # 0,2 con 1,1 con 2,0        
        #print("")
        juegosRestantes-=1#falta un juego menos para el cambio de host
        if juegosRestantes<=0 and cambios<(len(ordenLocalidad)-1): #si toca cambiar
            
            hostActual=(hostActual+1)%2 #hagale modulo al host actual porque boolean
            cambios+=1 #fijese en la siguiente cantidad de juegos en el array de orden
            juegosRestantes=ordenLocalidad[cambios] #y guardela como otra cuenta regresiva
            
    return tabla







def calcularCeldas(tabla,ph,pr,qr,qh,tamanyo):
    for j in range(tamanyo-1,-1,-1):
        for i in range(tamanyo-1,-1,-1):
            if tabla[j][i]==1:
                tabla[j][i]=ph*tabla[j+1][i]+qr*tabla[j][i+1]
            else:
                tabla[j][i]=pr*tabla[j+1][i]+qh*tabla[j][i+1]
    return tabla






def algoritmo(ph,pr,inicioLocalidad,ordenLocalidad):

    qr=1-ph
    qh=1-pr

    tamanyo=0
    for numero in ordenLocalidad:
        tamanyo+=numero
    tamanyo=math.floor(tamanyo/2)+1

    tabla=[]

    for j in range(tamanyo+1):
        fila=[]
        for i in range(tamanyo+1):
            if j!=tamanyo:
                if i!=tamanyo: fila.append(None)
                else: fila.append(0.0000)
            else:
                if i!=tamanyo: fila.append(1.0000)
                else: fila.append(None)
        tabla.append(fila)

    tabla=asignarLocalidad(tabla, inicioLocalidad, ordenLocalidad, tamanyo)
    tabla=calcularCeldas(tabla,ph,pr,qr,qh, tamanyo)
    return tabla

def adaptarFormato(formato):
    ordenLocalidad = [1]

    ultimoAnfitrion = formato[0]
    for juego in formato[1:(len(formato))]:
        if ultimoAnfitrion == juego:
            ordenLocalidad[-1]+=1
        else:
            ordenLocalidad.append(1)
        ultimoAnfitrion = juego
    return ordenLocalidad

def resolverSeriesDeportivas(ph,pr,formato):
    inicioLocalidad=0
    if (formato[0] == True):
        inicioLocalidad=1

    ordenLocalidad=adaptarFormato(formato)

    return {
        "resultado": algoritmo(ph, pr, inicioLocalidad, ordenLocalidad)
    } 

