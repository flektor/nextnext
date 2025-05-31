export function Tabs({ ref, labels, contents, defaultTabIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = createSignal(defaultTabIndex)

    const onClick = (event) => {
        const index = labels.findIndex((label) => label === event.target.textContent)
        setCurrentIndex(index)
    }

    const getClass = (label, index) => `tab-button ${labels[index] === label ? 'tab-button-active' : ''}`

    return (
        <div ref={ref} class="tabs">
            <p class="tab-buttons flex gap-4">
                {labels.map((label) => (
                    <button
                        class={getClass(label, currentIndex())}
                        onClick={onClick}
                    >
                        {label}
                    </button>
                ))}
            </p>
            {contents[currentIndex()]}
        </div>
    )
}

