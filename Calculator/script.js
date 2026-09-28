function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) return null;
  return a / b;
}

function operate(operator, a, b) {
  switch (operator) {
    case "+": return add(a, b);
    case "-": return subtract(a, b);
    case "*": return multiply(a, b);
    case "/": return divide(a, b);
    default: return null;
  }
}

let firstNumber = null;
let operator = null;
let secondNumber = null;

let displayValue = "0";
let expression = "";
let message = "";
let startNewNumber = true;
let resultDisplayed = false;
let errorState = false;

const MAX_INPUT_DIGITS = 12;
const display = document.querySelector("#display");
const expressionDisplay = document.querySelector("#expression");
const messageDisplay = document.querySelector("#message");
const decimalButton = document.querySelector("#decimal");
const buttons = document.querySelectorAll(".key");
const operatorButtons = document.querySelectorAll('[data-action="operator"]');
const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";

  const rounded = Number(value.toPrecision(12));
  const text = String(rounded);

  if (text.length > 14) {
    return rounded.toExponential(6).replace(/\.?0+e/, "e");
  }

  return text;
}

function render() {
  display.textContent = displayValue;
  expressionDisplay.textContent = expression;
  messageDisplay.textContent = message;
  messageDisplay.classList.toggle("error", errorState);

  decimalButton.disabled = !startNewNumber && !resultDisplayed && displayValue.includes(".");

  operatorButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.dataset.value === operator));
  });
}

function clearCalculator() {
  firstNumber = null;
  operator = null;
  secondNumber = null;
  displayValue = "0";
  expression = "";
  message = "";
  startNewNumber = true;
  resultDisplayed = false;
  errorState = false;
  render();
}

function updateCurrentNumber() {
  if (operator === null) {
    firstNumber = Number(displayValue);
  } else {
    secondNumber = Number(displayValue);
  }
}

function inputDigit(digit) {
  if (resultDisplayed || errorState) clearCalculator();

  message = "";

  if (startNewNumber) {
    displayValue = digit;
    startNewNumber = false;
  } else if (displayValue === "0") {
    displayValue = digit;
  } else if (displayValue.replace(".", "").length < MAX_INPUT_DIGITS) {
    displayValue += digit;
  } else {
    message = "You can enter up to 12 digits per number.";
    render();
    return;
  }

  updateCurrentNumber();
  render();
}

function inputDecimal() {
  if (resultDisplayed || errorState) clearCalculator();

  if (startNewNumber) {
    displayValue = "0.";
    startNewNumber = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  } else {
    return;
  }

  message = "";
  updateCurrentNumber();
  render();
}

function showError(text) {
  firstNumber = null;
  operator = null;
  secondNumber = null;
  displayValue = "Error";
  expression = "";
  message = text;
  startNewNumber = true;
  resultDisplayed = false;
  errorState = true;
  render();
}

function calculateCurrentPair() {
  const result = operate(operator, firstNumber, secondNumber);

  if (result === null) {
    showError("Nice try! You can’t divide by zero.");
    return null;
  }

  if (!Number.isFinite(result)) {
    showError("That number is too large. Try a smaller calculation.");
    return null;
  }

  return Number(result.toPrecision(12));
}

function chooseOperator(nextOperator) {
  if (errorState) return;

  if (firstNumber === null) {
    message = "Enter a number first.";
    render();
    return;
  }

  if (operator !== null && secondNumber !== null) {
    const result = calculateCurrentPair();
    if (result === null) return;
    firstNumber = result;
    displayValue = formatNumber(result);
  }

  operator = nextOperator;
  secondNumber = null;
  startNewNumber = true;
  resultDisplayed = false;
  message = "";
  expression = `${formatNumber(firstNumber)} ${operatorSymbols[operator]}`;
  render();
}

function pressEquals() {
  if (errorState || firstNumber === null || operator === null || secondNumber === null) {
    return;
  }

  const completedExpression = `${formatNumber(firstNumber)} ${operatorSymbols[operator]} ${formatNumber(secondNumber)} =`;
  const result = calculateCurrentPair();
  if (result === null) return;

  firstNumber = result;
  operator = null;
  secondNumber = null;
  displayValue = formatNumber(result);
  expression = completedExpression;
  message = "";
  resultDisplayed = true;
  startNewNumber = true;
  render();
}

function backspace() {
  if (errorState) {
    clearCalculator();
    return;
  }

  if (startNewNumber || resultDisplayed) return;

  displayValue = displayValue.slice(0, -1) || "0";
  message = "";
  updateCurrentNumber();
  render();
}

function handleAction(action, value) {
  switch (action) {
    case "digit": inputDigit(value); break;
    case "decimal": inputDecimal(); break;
    case "operator": chooseOperator(value); break;
    case "equals": pressEquals(); break;
    case "clear": clearCalculator(); break;
    case "backspace": backspace(); break;
  }
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleAction(button.dataset.action, button.dataset.value);
  });
});

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    inputDigit(event.key);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    event.preventDefault();
    chooseOperator(event.key);
  } else if (event.key === "x" || event.key === "X") {
    event.preventDefault();
    chooseOperator("*");
  } else if (event.key === ".") {
    event.preventDefault();
    inputDecimal();
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    pressEquals();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (["Escape", "Delete", "c", "C"].includes(event.key)) {
    event.preventDefault();
    clearCalculator();
  }
});

render();
