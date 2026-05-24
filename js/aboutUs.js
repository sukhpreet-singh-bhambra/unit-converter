// Sukhpreet Singh Bhambra | Student No. 9019231 | 2025
"use strict";

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function populateFooter() {
    $("#footerYear").textContent = new Date().getFullYear();
}

function toggleAccordion(event) {
    const button = event.currentTarget;
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    panel.hidden = isExpanded;
}

document.addEventListener("DOMContentLoaded", () => {
    populateFooter();

    $$(".accordion-header").forEach(button => {
        button.addEventListener("click", toggleAccordion);
    });
});
