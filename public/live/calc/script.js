document.addEventListener('DOMContentLoaded', () => {
    // Get references to the display and all buttons
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');

    // Variables to manage calculator state
    let currentInput = '0'; // Stores the number currently being entered
    let operator = null;     // Stores the selected operator (+, -, *, /)
    let previousInput = '';  // Stores the first operand or the result of a previous operation
    let resetDisplay = false; // Flag to clear display after an operation or equals is pressed

    /**
     * Updates the calculator display with the current input.
     * Ensures the display doesn't overflow.
     */
    function updateDisplay() {
        // Limit display length to avoid overflow, adjust as needed
        if (currentInput.length > 12) {
            display.textContent = parseFloat(currentInput).toPrecision(8); // Use precision for long numbers
        } else {
            display.textContent = currentInput;
        }
    }

    /**
     * Appends a number to the current input.
     * Handles initial '0' and decimal point logic.
     * @param {string} number - The number string to append.
     */
    function appendNumber(number) {
        if (resetDisplay) {
            currentInput = number;
            resetDisplay = false;
        } else {
            // Prevent multiple leading zeros (e.g., 007)
            if (currentInput === '0' && number !== '.') {
                currentInput = number;
            } else {
                currentInput += number;
            }
        }
        updateDisplay();
    }

    /**
     * Appends a decimal point to the current input.
     * Prevents multiple decimal points.
     */
    function appendDecimal() {
        if (resetDisplay) {
            currentInput = '0.';
            resetDisplay = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    }

    /**
     * Sets the selected operator and prepares for the next number.
     * If an operator is already set, it performs the previous calculation first.
     * @param {string} newOperator - The operator to set (+, -, *, /).
     */
    function setOperator(newOperator) {
        // If an operator is already active and previousInput exists, calculate the intermediate result
        if (operator && previousInput !== '') {
            calculateResult();
        }
        previousInput = currentInput; // Store the current input as the first operand
        operator = newOperator;      // Set the new operator
        resetDisplay = true;         // Prepare to clear the display for the next number
    }

    /**
     * Performs the calculation based on the stored operator and inputs.
     * Handles division by zero.
     */
    function calculateResult() {
        if (!operator || previousInput === '') {
            return; // Nothing to calculate if no operator or previous input
        }

        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

        if (isNaN(prev) || isNaN(current)) {
            currentInput = 'Error';
            updateDisplay();
            resetState();
            return;
        }

        let result;
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×': // Use '×' for multiplication as displayed on button
            case '*': // Also accept '*' from internal logic
                result = prev * current;
                break;
            case '÷': // Use '÷' for division as displayed on button
            case '/': // Also accept '/' from internal logic
                if (current === 0) {
                    currentInput = 'Error (Div by 0)';
                    updateDisplay();
                    resetState(); // Reset calculator state after error
                    return;
                }
                result = prev / current;
                break;
            default:
                return; // Should not happen
        }

        currentInput = result.toString(); // Update current input with the result
        operator = null; // Clear the operator after calculation
        previousInput = ''; // Clear previous input
        resetDisplay = true; // Prepare for a new calculation or continuous operations
        updateDisplay();
    }

    /**
     * Clears the entire calculator state.
     */
    function clearAll() {
        currentInput = '0';
        operator = null;
        previousInput = '';
        resetDisplay = false;
        updateDisplay();
    }

    /**
     * Resets the internal state of the calculator (used after errors).
     */
    function resetState() {
        operator = null;
        previousInput = '';
        resetDisplay = true;
    }

    /**
     * Handles the backspace functionality, deleting the last character from currentInput.
     */
    function backspace() {
        if (currentInput === 'Error (Div by 0)' || currentInput === 'Error') {
            clearAll(); // If it's an error, clear everything
            return;
        }
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1); // Remove the last character
        } else {
            currentInput = '0'; // If only one character left, set to '0'
        }
        updateDisplay();
    }

    // Add event listeners to all buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent; // Get the text content of the button
            const action = button.dataset.action;  // Get the data-action attribute

            if (!action) {
                // If no data-action, it's a number button
                appendNumber(buttonText);
            } else if (action === 'decimal') {
                appendDecimal();
            } else if (action === 'clear') {
                clearAll();
            } else if (action === 'equals') {
                calculateResult();
            } else if (action === 'backspace') {
                backspace();
            } else if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide') {
                // Map data-action to actual operator symbols
                let opSymbol;
                switch(action) {
                    case 'add': opSymbol = '+'; break;
                    case 'subtract': opSymbol = '-'; break;
                    case 'multiply': opSymbol = '×'; break; // Use '×' for display
                    case 'divide': opSymbol = '÷'; break;   // Use '÷' for display
                }
                setOperator(opSymbol);
            }
        });
    });

    // Initial display update
    updateDisplay();
});
