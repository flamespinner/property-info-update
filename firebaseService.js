import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

/**
 * Save property data to Firebase
 * @param {string} state - The state name (e.g., "Delaware").
 * @param {string} property - The property name (e.g., "Westover Pointe").
 * @param {object} propertyData - An object containing the property's details.
 */
function writePropertyData(state, property, propertyData) {
    const db = getDatabase();
    const propertyRef = ref(db, `properties/${state}/${property}`);
    return set(propertyRef, propertyData)
        .then(() => {
            console.log(`Property data for ${property} in ${state} saved successfully.`);
        })
        .catch((error) => {
            console.error("Error saving property data:", error);
        });
}

/**
 * Retrieve all property data for a specific state
 * @param {string} state - The state name (e.g., "Delaware").
 * @param {function} callback - A function to handle the retrieved data.
 */
function getPropertyDataByState(state, callback) {
    const db = getDatabase();
    const stateRef = ref(db, `properties/${state}`);
    onValue(stateRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    });
}

/**
 * Retrieve all properties across all states
 * @param {function} callback - A function to handle the retrieved data.
 */
function getAllPropertyData(callback) {
    const db = getDatabase();
    const propertiesRef = ref(db, "properties");
    onValue(propertiesRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    });
}

function updatePropertyData(state, property, partialData) {
    const db = getDatabase();
    const propertyRef = ref(db, `properties/${state}/${property}`);
    return update(propertyRef, partialData)
        .then(() => {
            console.log(`Property data for ${property} in ${state} updated successfully.`);
        })
        .catch((error) => {
            console.error("Error updating property data:", error);
        });
}

export { writePropertyData, updatePropertyData, getPropertyDataByState, getAllPropertyData };
