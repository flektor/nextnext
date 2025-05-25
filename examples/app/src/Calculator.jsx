
export function Calculator() {
    const [input1, setInput1] = createSignal(1);
    const [input2, setInput2] = createSignal(2);
    const [result, setResult] = createSignal(0);

    const calculate = (event) => {
        const op = event.target.textContent;
        const a = parseFloat(input1());
        const b = parseFloat(input2());
        if (isNaN(a) || isNaN(b)) {
            result.value = "Invalid input";
            return;
        }
        switch (op) {
            case "+": setResult(a + b); break;
            case "-": setResult(a - b); break;
            case "*": setResult(a * b); break;
            case "/": setResult(b !== 0 ? a / b : "Divide by zero"); break;
            default: result.value = "";
        }
    };

    const opButtons = ["+", "-", "*", "/"].map(op => (
        <button
            key={op}
            onClick={calculate}
            class="py-2 bg-blue-500 text-white rounded"
        >
            {op}
        </button>
    ))

    return (
        <div class="p-4 space-y-4 border rounded">
            <input
                type="number"
                placeholder="First number"
                value={input1()}
                onChange={setInput1}
                class="border w-full"
            />
            <input
                type="number"
                value={input2()}
                placeholder="Second number"
                onChange={setInput2}
                class="border w-full"
            />
            <p class="flex gap-8">
                {opButtons}
            </p>
            <span class="text-lg font-bold">Result: {result()}</span>
        </div>
    );
};

