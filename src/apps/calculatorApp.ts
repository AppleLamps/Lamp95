// Calculator App for Lamp95
export function initCalculator(windowElement: HTMLDivElement): void {
    const displayElement = windowElement.querySelector('.calculator-display') as HTMLInputElement;
    const buttons = windowElement.querySelectorAll('.calculator-button') as NodeListOf<HTMLButtonElement>;

    if (!displayElement || !buttons) return;

    let currentValue = '0';
    let previousValue = '';
    let operation: string | null = null;
    let waitingForNewValue = false;

    function updateDisplay() {
        displayElement.value = currentValue;
    }

    function clear() {
        currentValue = '0';
        previousValue = '';
        operation = null;
        waitingForNewValue = false;
        updateDisplay();
    }

    function appendNumber(number: string) {
        if (waitingForNewValue) {
            currentValue = number;
            waitingForNewValue = false;
        } else {
            currentValue = currentValue === '0' ? number : currentValue + number;
        }
        updateDisplay();
    }

    function appendDecimal() {
        if (waitingForNewValue) {
            currentValue = '0.';
            waitingForNewValue = false;
        } else if (!currentValue.includes('.')) {
            currentValue += '.';
        }
        updateDisplay();
    }

    function setOperation(op: string) {
        if (operation && !waitingForNewValue) {
            calculate();
        }
        previousValue = currentValue;
        operation = op;
        waitingForNewValue = true;
    }

    function calculate() {
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);
        let result: number;

        switch (operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
            default:
                return;
        }

        currentValue = result.toString();
        operation = null;
        waitingForNewValue = true;
        updateDisplay();
    }

    function backspace() {
        if (waitingForNewValue) return;
        currentValue = currentValue.slice(0, -1);
        if (currentValue === '') currentValue = '0';
        updateDisplay();
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            if (!value) return;

            if (value >= '0' && value <= '9') {
                appendNumber(value);
            } else if (value === '.') {
                appendDecimal();
            } else if (['+', '-', '*', '/'].includes(value)) {
                setOperation(value);
            } else if (value === '=') {
                calculate();
            } else if (value === 'C') {
                clear();
            } else if (value === '←') {
                backspace();
            }
        });
    });

    // Initialize display
    updateDisplay();
}