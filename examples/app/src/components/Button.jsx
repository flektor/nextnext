export function Button({ label, color, onClick }) {
  const className = color === "red" ? "text-red" : "text-red";
  const button = <button class={className} onClick={onClick}>
    {label}
    </button>
  return button
}
