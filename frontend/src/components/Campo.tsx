interface Props {
  id: string
  etiqueta: string
  ayuda?: string
  valor: string
  error?: string
  modo?: 'decimal' | 'numeric'
  onChange: (valor: string) => void
  onBlur: () => void
}

/** Campo de texto numérico con etiqueta, ayuda y mensaje de error accesibles. */
export default function Campo({ id, etiqueta, ayuda, valor, error, modo = 'decimal', onChange, onBlur }: Props) {
  const describedBy = [ayuda ? `${id}-ayuda` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ')
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        className="entrada"
        type="text"
        inputMode={modo}
        autoComplete="off"
        value={valor}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {ayuda && <p className="ayuda" id={`${id}-ayuda`}>{ayuda}</p>}
      {error && <p className="error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}
