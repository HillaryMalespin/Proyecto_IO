import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TablaSeriesDeportivas from '../components/TablaSeriesDeportivas'
import {
  MAX_JUEGOS,
  type Problema,
} from '../lib/seriesDeportivas'

export default function SeriesDeportivas() {
  const [juegos, setJuegos] = useState<string>("")
  const [ph, setPH] = useState<string>("")
  const [pr, setPR] = useState<string>("")
  const [formato, setFormato] = useState<boolean[]>([])
  const [resultado, setResultado] = useState<number[][]>([])
  const [resolviendo, setResolviendo] = useState<boolean>(false)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [cargando, setCargando] = useState<boolean>(false)

  const cambiarTamanyoFormato = async (entrada: number) =>{
    setResultado([])
  
    if (entrada > 0 && entrada <= MAX_JUEGOS){
      const largo = formato.length //valor de referencia

      if (largo > entrada){
        formato.splice(entrada)
      }
      else if (largo < entrada){
        for (let i = 0; i < entrada-largo; i++){
          formato.push(true)
        }
      }
      //no se considera si largo == entrada porque no se requieren cambios
    }
    else if (entrada == 0){
      setFormato([])//no hay juegos
    }
    else{
      //todo tamanyo invalido
    }
  }

  const cambiarCantidad = async (entrada: string) =>{
    setResultado([])

    //Solo se acepta entrada vacia o numeros enteros
    if (entrada == "" || ( !entrada.includes(".") && !entrada.includes("-") && !isNaN(Number(entrada)) && Number.isInteger(Number(entrada)) )) {
      //si entrada == "", Number(entrada)=0, por lo que es seguro
      if (Number(entrada) > MAX_JUEGOS){//aceptar la entrada, pero limitarla
        entrada = String(MAX_JUEGOS)
      }
      else if (entrada == "0") {//aceptar la entrada, pero limitarla
        entrada = "1"
      }

      setJuegos(entrada) //Se permite vacio si entrada == ""
      cambiarTamanyoFormato(Number(entrada))
    }
    else {
      //todo error solo se permiten numeros enteros
    }
  }
  const cambiarPH = async (entrada: string) =>{
    setResultado([])

    if (entrada == ""){
      setPH(entrada)
    }
    else if (!isNaN(Number(entrada)) && Number(entrada)>=0 && Number(entrada)<=1) {
      setPH(entrada)
    }
  }
  const cambiarPR = async (entrada: string) =>{
    setResultado([])

    if (entrada == ""){
      setPR(entrada)
    }
    else if (!isNaN(Number(entrada)) && Number(entrada)>=0 && Number(entrada)<=1) {
      setPR(entrada)
    }
  }
  const cambiarHostJuego = async (numeroJuego: number, estado: boolean) =>{
    setResultado([])

    if (numeroJuego <= Number(juegos) && numeroJuego >=0 ){
      if (Number.isInteger(Number(numeroJuego))){
        const nuevoformato = [...formato] //copiar de manera que el puntero cambie al hacer setFormato
        nuevoformato[numeroJuego] = estado
        setFormato(nuevoformato)
      }
      else {
        //todo error indice decimal invalido
      }
    }
    else{
      //todo error indice invalido
    }
  }

  const cargar = async () =>{
    setResultado([])
    setCargando(true)
    //TODO
    setCargando(false)
  }
  const guardar = async () =>{
    setGuardando(true)
    //TODO
    setGuardando(false)
  }

  const resolver = async (e: FormEvent) =>{
    e.preventDefault()

    if (resultado.length == 0){//si hay algo que resolver
      if (juegos == "" || ph == "" || pr == ""){
        //todo avisar q faltan campos
      }
      else {
        setResolviendo(true)
        try {
          const problema: Problema = {
            ph: Number(ph),
            pr: Number(pr),
            formato: formato
          }
          // El algoritmo se ejecuta en el backend; aqui solo se envia y se muestra
          const r = await fetch('/api/series-deportivas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(problema),
          })
          if (!r.ok) {
            /*setAviso({
              tipo: 'error',
              texto:
                r.status === 422
                  ? 'El servidor rechazó los datos. Revíselos e intente de nuevo.'
                  : 'El servidor no pudo resolver el problema.',
            }) todo aviso*/
            return
          }
          const datos = await r.json()
          // Reviso la forma de la respuesta antes de usarla, para no romper la pantalla
          if (
            !datos || datos.resultado.constructor !== Array
          ) {
            //todo setAviso({ tipo: 'error', texto: 'Respuesta inesperada del servidor.' })
            return
          }
          setResultado(datos.resultado)
        } catch {
          /*todo setAviso({
            tipo: 'error',
            texto: 'No se pudo conectar con el servidor. Verifique que el backend esté activo.',
          })*/
        } finally {
          setResolviendo(false)
        }
      }
    }
  }

  return (
    <main className="pagina">
      <Link to="/" className="volver">← Menú principal</Link>

      <header className="encabezado-pagina">
        <h1><span>Series Deportivas</span></h1>
        <p className="subtitulo">Ingrese los datos de los equipos, configure el formato, y seleccione "Resolver".</p>
      </header>

      <section className="hoja" aria-label="Datos del problema">
        <div className="acciones">
          {/* El input real queda oculto: el label hace de boton */}
          <label className="boton boton-sec">
            Cargar archivo
            <input type="file" accept=".json,application/json" onChange={cargar} className="solo-lector" />
          </label>
          <button type="button" className="boton boton-sec" onClick={guardar}>
            Guardar archivo
          </button>
        </div>

        <form noValidate onSubmit={resolver}>

          <div className="campo" style={{paddingBottom: 25}}>
            <label htmlFor="cap">Cantidad de juegos (1 a {MAX_JUEGOS}) </label>
            <input
              id="cap"
              inputMode="numeric"
              autoComplete="off"
              value={juegos}
              onChange={(e) => cambiarCantidad(e.target.value)}
            />
          </div>

          <div style={{paddingBottom: 25, display: "flex", flexDirection: "row", alignItems: "center"}}> {/*todo custom class*/}
            <div className="campo">
              <label htmlFor="cap">Probabilidad que equipo A gane si está en casa (ph)</label>
              <input
                id="cap"
                inputMode="numeric"
                autoComplete="off"
                value={ph}
                onChange={(e) => cambiarPH(e.target.value)}
              />
            </div>
            <div className="campo" style={{paddingLeft:20}}> {/*todo custom class*/}
              <label htmlFor="cap">{`Probabilidad que equipo B gane si está de visita (qr): 
                ${ph? (ph.length > 3)? String((1-Number(ph)).toFixed(ph.length-2)) : String((1-Number(ph)).toFixed(2)): ""}`
              }</label>
            </div>
          </div>

          <div style={{paddingBottom: 25, display: "flex", flexDirection: "row", alignItems: "center"}}> {/*todo custom class*/}
            <div className="campo">
              <label htmlFor="cap">Probabilidad que equipo A gane si está de visita (qr)</label>
              <input
                id="cap"
                inputMode="numeric"
                autoComplete="off"
                value={pr}
                onChange={(e) => cambiarPR(e.target.value)}
              />
            </div>
            <div className="campo" style={{paddingLeft:20}}> {/*todo custom class*/}
              <label htmlFor="cap">{`Probabilidad que equipo B gane si está en casa (qh): 
                ${pr? (pr.length > 3)? String((1-Number(pr)).toFixed(pr.length-2)) : String((1-Number(pr)).toFixed(2)): ""}`
              }</label>
            </div>
          </div>

          <h2>Formato de la serie</h2>

          <ul className="lista-objetos">{/*todo use my own*/}
            {formato.length != 0 && (() => {
              const partidos = [];
              for (let i = 0; i < formato.length; i++) {
                const anfitrion = formato[i]
                partidos.push(
                  <div key={i} className="objeto" style={{alignItems: "center"}}>{/*todo use my own*/}

                    <h3 style={{paddingLeft:20, marginTop:10}}> {String(i+1)} </h3>{/*todo use my own*/}

                    <div className="campo">
                      <label> Equipo A es: </label>
                      <div>
                        <button
                          type="button"
                          className="boton boton-sec"
                          style = {{
                            backgroundColor: anfitrion? "#555": "#FFF",
                            color: anfitrion? "#FFF": "#999"
                          }}
                          onClick={() => cambiarHostJuego(i, true)}
                        >
                          Anfitrion
                        </button>
                        <button
                          type="button"
                          className="boton boton-sec"
                          style = {{
                            backgroundColor: anfitrion? "#FFF": "#555",
                            color: anfitrion? "#999": "#FFF"
                          }}
                          onClick={() => cambiarHostJuego(i, false)}
                        >
                          Visitante
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }
              return partidos
              })()
            }
          </ul>

          <div className="acciones">
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? 'Resolviendo…' : 'Resolver'}
            </button>
          </div>
        </form>
      </section>

      {(resultado.length != 0) && (
        <section className="hoja resultados" aria-label="Resultado">
          <h2>Resultado</h2>

          <h3>Tabla de programación dinámica</h3>
          <TablaSeriesDeportivas
          resultado={resultado}
          />
        </section>
      )}
    </main>
  )
}

//todo avisar si hay problemas al resolver, cargar, guardar, formato erroneo de inputs en 1 y mas de 11, etc.