export function Button({ label }) {
  const onClick = () => console.log('boom!')
  console.log('eeeeee')
  return <button onClick={onClick}>{label}</button>
}
