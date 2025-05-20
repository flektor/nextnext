export function Button({  color, onClick }) {
  const label = "Click me!"
  const className = color === "red" ? "bg-red-500" : "bg-blue-500";
  const button = <button class={className} onClick={onClick}>
    {label}
    </button>
  return button
}
