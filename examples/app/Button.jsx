export function Button({ label, color, children, onClick }) {
  onClick = onClick ?? (() => console.log('Boom!'))

  const className = color === "red" ? "bg-red-500" : "bg-blue-500";
  const button = <button class={className} onClick={onClick}>{label ?? children}</button>
  return button
}
