import { writePropertyData, getPropertyDataByState, updatePropertyData } from "./firebaseService.js";

// Add this function at the start of your file
function showAlert(message, isSuccess = true) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${isSuccess ? 'success' : 'error'}`;
    alertDiv.innerHTML = `
        <div class="alert-content">
            <p>${message}</p>
            <button class="close-alert">×</button>
        </div>
    `;

    // Add to document
    document.body.appendChild(alertDiv);

    // Add click handler to close button
    alertDiv.querySelector('.close-alert').addEventListener('click', () => {
        alertDiv.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(alertDiv)) {
            alertDiv.remove();
        }
    }, 5000);
}

function escapeCSSSelector(str) {
    // If the string starts with a digit, escape it
    if (/^\d/.test(str)) {
        return '\\3' + str[0] + ' ' + str.slice(1);
    }
    return str;
}

function populateExistingData() {
    const state = document.title.split(": ")[1];
    
    getPropertyDataByState(state, (data) => {
        if (data) {
            // Iterate through each property in the data
            Object.entries(data).forEach(([propertyName, propertyData]) => {
                // Find the corresponding grid item
                const propertyElement = Array.from(document.querySelectorAll('.grid-item'))
                    .find(element => element.querySelector('h2 span').textContent.trim() === propertyName);
                
                if (propertyElement) {
                    // Populate each field
                    Object.entries(propertyData).forEach(([role, info]) => {
                        if (role.includes('-unit')) {
                            const unitField = propertyElement.querySelector(`#${escapeCSSSelector(role)}`);
                            if (unitField) {
                                unitField.value = info;
                            }
                        } else {
                            // Handle name field
                            const nameField = propertyElement.querySelector(`#${escapeCSSSelector(role)}-name`);
                            if (nameField && info.name) {
                                nameField.value = info.name;
                                // Log when loading accountant entries for visibility during dev
                                if (role.toLowerCase().includes('accountant')) {
                                    console.log(`Loaded accountant for ${propertyName}: ${info.name}`);
                                }
                            }
                            
                            // Handle email field
                            const emailField = propertyElement.querySelector(`#${escapeCSSSelector(role)}-email`);
                            if (emailField && info.email) {
                                emailField.value = info.email;
                            }
                        }
                    });
                }
            });
        }
    });
}

function collectData() {
    const data = {};
    const properties = document.querySelectorAll(".grid-item");

    properties.forEach((property) => {
        const propertyName = property.querySelector("h2 span").textContent.trim();
        const fields = property.querySelectorAll("textarea");

        data[propertyName] = {};

        fields.forEach((field) => {
            const id = field.id;
            const value = field.value.trim();

            // Get the base ID without -name or -email
            const baseId = id.replace(/-name$/, '').replace(/-email$/, '');

            if (id.includes('unit')) {
                data[propertyName][baseId] = value;
            } else if (id.includes('name')) {
                data[propertyName][baseId] = data[propertyName][baseId] || {};
                data[propertyName][baseId].name = value;
            } else if (id.includes('email')) {
                data[propertyName][baseId] = data[propertyName][baseId] || {};
                data[propertyName][baseId].email = value;
            }
        });
    });

    return data;
}

// Add event listener for page load
document.addEventListener('DOMContentLoaded', () => {
    populateExistingData();
});

document.getElementById("submit-button").addEventListener("click", async () => {
    const state = document.title.split(": ")[1];
    const data = collectData();
    let allSaved = true;
    let errorMessages = [];

    // Create a promise for each property save (use update to avoid overwriting unexpected fields)
    const savePromises = Object.entries(data).map(([propertyName, propertyData]) => {
        return updatePropertyData(state, propertyName, propertyData)
            .then(() => {
                console.log(`Data for ${propertyName} in ${state} updated successfully.`);
            })
            .catch((error) => {
                allSaved = false;
                errorMessages.push(`Error saving ${propertyName}: ${error.message}`);
                console.error(`Error saving data for ${propertyName}:`, error);
            });
    });

    // Wait for all saves to complete
    await Promise.all(savePromises);

    // Show appropriate styled alert based on results
    if (allSaved) {
        showAlert(`All property data for ${state} has been successfully saved!`, true);
    } else {
        showAlert(`Some errors occurred while saving:\n${errorMessages.join('\n')}`, false);
    }
});
