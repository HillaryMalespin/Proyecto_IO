export default function TablaSeriesDeportivas(props: {resultado: number[][]}) {
  const resultado = props.resultado
  return (
    <div className="tabla-scroll">
      <table className="tabla-mochila"> {/*todo use my own*/}
        <thead>
          <tr>
            <th scope="col"></th>{(() => {
                const columnas =[];
                for (let i = 0; i < resultado.length; i++) {
                    columnas.push(<th scope="col" key={i}>{i}</th>)
                }
                return columnas
            })()}
          </tr>
        </thead>
        <tbody>{(() => {
            const filas = [];
            for (let j = 0; j < resultado.length; j++) {
                filas.push(
                    <tr>
                    <th scope="row" key={j}>{j}</th>
                    {(() => {
                        const fila = [];
                        for (let i = 0; i < resultado.length; i++){
                          if(j == resultado.length-1 && i == resultado.length-1){
                            fila.push(<th scope="row" key="" style={{backgroundColor:"#000"}}></th>)
                          }
                          else{
                              fila.push(<th scope="row" key={Number(resultado[i][j]).toFixed(4)}>{Number(resultado[i][j]).toFixed(4)}</th>)
                            }
                        }
                        return fila
                    })()}
                    </tr>
                )
            }
            return filas
        })()}
        </tbody>
      </table>
    </div>
  )
}