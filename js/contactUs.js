// Sukhpreet Singh Bhambra | Student No. 9019231 | 2025
"use strict";

const $ = selector => document.querySelector(selector);

function populateFooter() {
    $("#footerDynamicInfo").textContent = `\u00a9 Sukhpreet Singh Bhambra | Student No. 9019231 | ${new Date().getFullYear()}`;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasOnlyLetters(value) {
    return /^[A-Za-z\s'-]+$/.test(value);
}

function validateForm(form) {
    const fields = form.elements;
    const firstName = fields.firstName.value.trim();
    const lastName = fields.lastName.value.trim();
    const mobileNumber = fields.mobileNumber.value.trim();
    const email = fields.mail.value.trim();
    const subject = fields.subject.value.trim();
    const query = fields.query.value.trim();
    const errors = [];

    if (!firstName || !hasOnlyLetters(firstName)) {
        errors.push("First name is required and must contain letters only.");
    }

    if (lastName && !hasOnlyLetters(lastName)) {
        errors.push("Last name must contain letters only.");
    }

    if (!/^\d{7,15}$/.test(mobileNumber)) {
        errors.push("Mobile number must contain 7 to 15 digits.");
    }

    if (!validateEmail(email)) {
        errors.push("Please enter a valid email address.");
    }

    if (!subject) {
        errors.push("Subject is required.");
    }

    if (!query) {
        errors.push("Query is required.");
    }

    return errors;
}

function showMessage(message, type) {
    const formMessage = $("#formMessage");
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = $("#contactUsForm");

    populateFooter();
    $("#firstName").focus();

    form.addEventListener("submit", event => {
        event.preventDefault();

        const errors = validateForm(form);

        if (errors.length > 0) {
            showMessage(errors.join(" "), "error");
            return;
        }

        showMessage("Query submitted successfully.", "success");
        form.reset();
    });

    form.addEventListener("reset", () => {
        showMessage("", "");
    });
});
