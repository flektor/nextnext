export function Button({  color, onClick }) {
  const label = "Click me!"
  const className = color === "red" ? "text-red" : "text-red";
  const button = <button class={className} onClick={onClick}>
    {label}
    </button>
  return button
}
