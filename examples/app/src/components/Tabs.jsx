export function Tabs({ ref, labels, contents }) {
    const [activeContent, setActiveContent] = createSignal(contents[0])

    const onClick = (event) => {
        const index = labels.findIndex((label) => label === event.target.textContent)
        setActiveContent(contents[index])
    }
    const Buttons = () => {
        return labels.map((label) => (
            <button
                class={`tab-button ${activeContent() === label ? 'active' : ''}`}
                onClick={onClick}
            >
                {label}
            </button>
        ))
    }

    return (
        <div ref={ref} class="tabs">
            <p class="tab-buttons">
                <Buttons></Buttons>
            </p>
            <span>{activeContent()}</span>
        </div>
    )
}

