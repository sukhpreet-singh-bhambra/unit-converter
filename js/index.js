// Sukhpreet Singh Bhambra | Student No. 9019231 | 2025
"use strict";

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const HISTORY_KEY = "unitConverterHistory";
const MAX_HISTORY_ITEMS = 6;

let selectedCategory = "area";
let lastSavedSignature = "";
let lastResultText = "";
let historyTimer = null;

const categoriesAndUnits = {
    area: {
        "Square Millimeter": 1000000,
        "Square Centimeter": 10000,
        "Square Inch": 1550.0031000062,
        "Square Foot": 10.7639104167,
        "Square Yard": 1.1959900463,
        "Square Meter": 1,
        Hectare: 0.0001,
        Acre: 0.000247105381467,
        "Square Kilometer": 0.000001,
        "Square Mile": 0.000000386102158542
    },
    length: {
        Micrometer: 1000000,
        Millimeter: 1000,
        Centimeter: 100,
        Inch: 39.3700787402,
        Decimeter: 10,
        Foot: 3.280839895,
        Yard: 1.0936132983,
        Meter: 1,
        Kilometer: 0.001,
        Mile: 0.000621371192237
    },
    temperature: {
        Celsius: "celsius",
        Fahrenheit: "fahrenheit",
        Kelvin: "kelvin"
    },
    time: {
        Microsecond: 86400000000,
        Millisecond: 86400000,
        Second: 86400,
        Minute: 1440,
        Hour: 24,
        Day: 1,
        Week: 0.142857143,
        Fortnight: 0.071428571,
        Month: 0.032854209,
        Year: 0.002737851
    },
    volume: {
        Milliliter: 1000,
        Centiliter: 100,
        Deciliter: 10,
        Liter: 1,
        Dekaliter: 0.1,
        Hectoliter: 0.01,
        Kiloliter: 0.001,
        "Cubic Meter": 0.001,
        "US Gallon": 0.264172052358,
        "Imperial Gallon": 0.2199692483
    },
    weight: {
        Milligram: 1000000,
        Centigram: 100000,
        Decigram: 10000,
        Gram: 1000,
        Dekagram: 100,
        Hectogram: 10,
        Kilogram: 1,
        "Metric Ton": 0.001,
        Pound: 2.20462262185,
        Ounce: 35.2739619496
    }
};

function getPrecision() {
    return Number.parseInt($("#precisionRange").value, 10);
}

function formatNumber(value) {
    const precision = getPrecision();

    if ($("#formatMode").value === "scientific") {
        return value.toExponential(precision);
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: precision,
        useGrouping: true
    }).format(value);
}

function populateFooter() {
    $("#footerDynamicInfo").textContent = `\u00a9 Sukhpreet Singh Bhambra | Student No. 9019231 | ${new Date().getFullYear()}`;
}

function getUnits(category = selectedCategory) {
    return Object.keys(categoriesAndUnits[category]);
}

function renderOptions(selectElement, units, selectedValue = "") {
    selectElement.replaceChildren();

    units.forEach(unit => {
        const option = document.createElement("option");
        option.value = unit;
        option.textContent = unit;
        selectElement.append(option);
    });

    selectElement.value = units.includes(selectedValue) ? selectedValue : "";
    if (!selectElement.value) {
        selectElement.selectedIndex = -1;
    }
}

function filterUnits(selectElement, searchElement) {
    const currentValue = selectElement.value;
    const searchTerm = searchElement.value.trim().toLowerCase();
    const matchingUnits = getUnits().filter(unit => unit.toLowerCase().includes(searchTerm));

    renderOptions(selectElement, matchingUnits, currentValue);
    convertValue();
}

function populateUnits(category) {
    $("#fromUnitSearch").value = "";
    $("#toUnitSearch").value = "";
    renderOptions($("#fromUnit"), getUnits(category));
    renderOptions($("#toUnit"), getUnits(category));
    $("#toValue").value = "";
    lastResultText = "";
    $("#formulaText").textContent = "Select units to view the conversion formula.";
    $("#resultSection").textContent = "Enter a value and select both units to see the result.";
}

function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return value;
    }

    const conversions = {
        "Celsius:Fahrenheit": input => (input * 9 / 5) + 32,
        "Celsius:Kelvin": input => input + 273.15,
        "Fahrenheit:Celsius": input => (input - 32) * 5 / 9,
        "Fahrenheit:Kelvin": input => (input - 32) * 5 / 9 + 273.15,
        "Kelvin:Celsius": input => input - 273.15,
        "Kelvin:Fahrenheit": input => (input - 273.15) * 9 / 5 + 32
    };

    return conversions[`${fromUnit}:${toUnit}`](value);
}

function isBelowAbsoluteZero(value, unit) {
    const absoluteZero = {
        Celsius: -273.15,
        Fahrenheit: -459.67,
        Kelvin: 0
    };

    return value < absoluteZero[unit];
}

function getTemperatureFormula(fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return `Same unit selected: value stays in ${toUnit}.`;
    }

    const formulas = {
        "Celsius:Fahrenheit": "Fahrenheit = (Celsius x 9 / 5) + 32",
        "Celsius:Kelvin": "Kelvin = Celsius + 273.15",
        "Fahrenheit:Celsius": "Celsius = (Fahrenheit - 32) x 5 / 9",
        "Fahrenheit:Kelvin": "Kelvin = (Fahrenheit - 32) x 5 / 9 + 273.15",
        "Kelvin:Celsius": "Celsius = Kelvin - 273.15",
        "Kelvin:Fahrenheit": "Fahrenheit = (Kelvin - 273.15) x 9 / 5 + 32"
    };

    return formulas[`${fromUnit}:${toUnit}`];
}

function getConversion(value, fromUnit, toUnit) {
    if (selectedCategory === "temperature") {
        return convertTemperature(value, fromUnit, toUnit);
    }

    return (value / categoriesAndUnits[selectedCategory][fromUnit]) * categoriesAndUnits[selectedCategory][toUnit];
}

function updateFormula(fromUnit, toUnit) {
    const formulaText = $("#formulaText");

    if (!fromUnit || !toUnit) {
        formulaText.textContent = "Select units to view the conversion formula.";
        return;
    }

    if (selectedCategory === "temperature") {
        formulaText.textContent = getTemperatureFormula(fromUnit, toUnit);
        return;
    }

    const rate = categoriesAndUnits[selectedCategory][toUnit] / categoriesAndUnits[selectedCategory][fromUnit];
    formulaText.textContent = `1 ${fromUnit} = ${formatNumber(rate)} ${toUnit}`;
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function saveHistory(items) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
        $("#resultSection").textContent = "Conversion complete. Browser storage is unavailable for history.";
    }
}

function renderHistory() {
    const historyList = $("#historyList");
    const history = loadHistory();

    historyList.replaceChildren();

    if (history.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No conversions yet.";
        historyList.append(emptyItem);
        return;
    }

    history.forEach(item => {
        const listItem = document.createElement("li");
        const result = document.createElement("strong");
        const meta = document.createElement("span");

        result.textContent = `${item.input} ${item.fromUnit} = ${item.output} ${item.toUnit}`;
        meta.textContent = `${item.category} | ${item.createdAt}`;
        listItem.append(result, meta);
        historyList.append(listItem);
    });
}

function queueHistoryItem(item) {
    const signature = `${item.category}:${item.input}:${item.fromUnit}:${item.output}:${item.toUnit}`;

    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
        if (signature === lastSavedSignature) {
            return;
        }

        const history = loadHistory().filter(historyItem => (
            `${historyItem.category}:${historyItem.input}:${historyItem.fromUnit}:${historyItem.output}:${historyItem.toUnit}` !== signature
        ));

        history.unshift(item);
        saveHistory(history.slice(0, MAX_HISTORY_ITEMS));
        lastSavedSignature = signature;
        renderHistory();
    }, 350);
}

function convertValue() {
    const fromValue = Number.parseFloat($("#fromValue").value);
    const fromUnit = $("#fromUnit").value;
    const toUnit = $("#toUnit").value;
    const resultSection = $("#resultSection");
    const toValue = $("#toValue");

    updateFormula(fromUnit, toUnit);

    if (Number.isNaN(fromValue)) {
        toValue.value = "";
        resultSection.textContent = "Please enter a valid number.";
        return null;
    }

    if (!fromUnit || !toUnit) {
        toValue.value = "";
        resultSection.textContent = "Please select both FROM and TO units.";
        return null;
    }

    if (selectedCategory === "temperature" && isBelowAbsoluteZero(fromValue, fromUnit)) {
        toValue.value = "";
        resultSection.textContent = `${fromUnit} cannot be below absolute zero.`;
        return null;
    }

    const result = getConversion(fromValue, fromUnit, toUnit);
    const formattedInput = formatNumber(fromValue);
    const formattedResult = formatNumber(result);

    toValue.value = formattedResult;
    lastResultText = `Result: ${formattedInput} ${fromUnit} = ${formattedResult} ${toUnit}`;
    resultSection.textContent = lastResultText;

    queueHistoryItem({
        category: selectedCategory,
        input: formattedInput,
        output: formattedResult,
        fromUnit,
        toUnit,
        createdAt: new Date().toLocaleString()
    });

    return result;
}

function changeCategory(event) {
    selectedCategory = event.currentTarget.value;

    $$(".category-button").forEach(button => {
        button.classList.toggle("active", button === event.currentTarget);
    });

    $("#fromValue").value = "";
    populateUnits(selectedCategory);
}

function swapUnits() {
    const fromUnit = $("#fromUnit").value;
    const toUnit = $("#toUnit").value;
    const convertedValue = $("#toValue").value.replaceAll(",", "");

    if (!fromUnit || !toUnit) {
        $("#resultSection").textContent = "Select both units before swapping.";
        return;
    }

    $("#fromUnitSearch").value = "";
    $("#toUnitSearch").value = "";
    renderOptions($("#fromUnit"), getUnits(), toUnit);
    renderOptions($("#toUnit"), getUnits(), fromUnit);

    if (convertedValue) {
        $("#fromValue").value = convertedValue;
    }

    convertValue();
}

async function copyResult() {
    if (!$("#toValue").value) {
        $("#resultSection").textContent = "Convert a value before copying the result.";
        return;
    }

    try {
        await navigator.clipboard.writeText(lastResultText);
        $("#resultSection").textContent = "Result copied to clipboard.";
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = lastResultText;
        textarea.setAttribute("readonly", "");
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        $("#resultSection").textContent = "Result copied to clipboard.";
    }
}

function clearHistory() {
    saveHistory([]);
    lastSavedSignature = "";
    renderHistory();
}

document.addEventListener("DOMContentLoaded", () => {
    populateFooter();
    populateUnits(selectedCategory);
    renderHistory();

    $$(".category-button").forEach(button => {
        button.addEventListener("click", changeCategory);
    });

    $("#fromValue").addEventListener("input", convertValue);
    $("#fromUnit").addEventListener("change", convertValue);
    $("#toUnit").addEventListener("change", convertValue);
    $("#precisionRange").addEventListener("input", event => {
        $("#precisionOutput").textContent = event.currentTarget.value;
        convertValue();
    });
    $("#formatMode").addEventListener("change", convertValue);
    $("#fromUnitSearch").addEventListener("input", () => filterUnits($("#fromUnit"), $("#fromUnitSearch")));
    $("#toUnitSearch").addEventListener("input", () => filterUnits($("#toUnit"), $("#toUnitSearch")));
    $("#swapUnits").addEventListener("click", swapUnits);
    $("#copyResult").addEventListener("click", copyResult);
    $("#clearHistory").addEventListener("click", clearHistory);
});
