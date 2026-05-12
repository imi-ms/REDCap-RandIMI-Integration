// Tested with RandIMI API version 2.0

/**
 * @typedef {Object} StratumValue
 * @description Definition of a stratum value in the study.
 * @property {string} name The display name of the stratum value.
 * @property {string} apiId The API ID used to identify the stratum value.
 */

/**
 * @typedef {Object} StratumDefinition
 * @description Definition of a stratum in the study.
 * @property {string} name The display name of the stratum.
 * @property {string} apiId The API ID used to identify the stratum.
 * @property {string} type The type of the stratum. Possible values are INTERVAL and ENUM.
 * @property {StratumValue[]} values List of possible values for ENUM strata.
 */

/**
 * @typedef StrataInfoResponseV2
 * @description Response format for strata information from the RandIMI API.
 * @property {StratumDefinition[]} strata List of strata in the study. The location stratum is not included.
 */

/**
 * @typedef {Object} SiteResource
 * @description Definition of a site in the RandIMI API. Corresponds to REDCap DAGs.
 * @property {string} name The display name of the site.
 * @property {string} apiId The API ID used to identify the site, corresponds to the REDCap Group ID number.
 */

/**
 * @typedef StudyArmResource
 * @description Definition of a study arm in the RandIMI API.
 * @property {string} name The display name of the study arm.
 * @property {string} apiId The API ID used to identify the study arm.
 */

/**
 * @typedef {Object} StudyResource
 * @description Definition of a study in the RandIMI API.
 * @property {string} name The display name of the study.
 * @property {string} apiId The API ID used to identify the study.
 * @property {string} pseudonymHandling Defines the uniqueness of pseudonyms. Possible values are: UNIQUE_IN_STUDY and UNIQUE_IN_LOCATION.
 * @property {SiteResource[]} sites List of sites.
 * @property {StudyArmResource[]} arms List of study arms.
 * @property {StratumDefinition[]} strata List of strata. The location stratum is not included.
 */

/**
 * @typedef SubjectResource
 * @description Definition of a subject in the RandIMI API.
 * @property {string} pseudonym The pseudonym of the subject.
 * @property {StudyArmResource} studyArm The assigned study arm.
 * @property {SiteResource} site The assigned site.
 * @property {Record<string, string>} stratificationParameters Stratification parameters of the subject.
 */

/**
 * @typedef {Object} RandomizationResult
 * @description Response format containing the result of randomization.
 * @property {SubjectResource} subject The subject that was randomized.
 */

$(document).ready(function() {
    addLocationInput();
    addPseudonymInput();
    fetchStudyResource();
    internationalize();
    setEventListeners();
    processURLParameter();
});

function addPseudonymInput() {
    $("<div class='form-group'><label id='pseudonym-label'>" + "Pseudonym" + "</label><input type='text' class='form-control' id='" + "pseudonym" + "' autocomplete='off'></div>").insertBefore("#hr-footer");
}

function addLocationInput() {
    // Create sorted data access group select
    var groupNameHTMLOptions = "<option></option>";
    for (var groupName of Object.values(randimi.groupNames).sort()) {
        const groupId = Object.keys(randimi.groupNames).find(groupId => randimi.groupNames[groupId] === groupName);
        groupNameHTMLOptions += "<option value='" + groupId + "'>" + groupName + "</option>";
    }

    $("<div class='form-group'><label id='location-label'>" + "Location" + "</label><select class='form-control' id='" + "location" + "'>" + groupNameHTMLOptions + "</div>").insertBefore("#hr-footer");

    if (Object.keys(randimi.groupNames).length == 0) {
        $("#no-dag-warning").show();
        $("#randimi-submit-button").prop("disabled", true);
    } else if (Object.keys(randimi.groupNames).length == 1) {
        $("#location").val(Object.keys(randimi.groupNames)[0]);
        $("#location").prop("disabled", true);
    } else if (Object.keys(randimi.groupNames).length > 1 && randimi.userRights.group_id) {
        $("#location").val(randimi.userRights.group_id);
        $("#location").prop("disabled", true);
    }
}

function getHeaders() {
    const headers = {};
    headers["Accept-Language"] = randimi.language;
    if (!randimi.useTunnel) headers["Authorization"] = "Basic " + btoa(randimi.username + ":" + randimi.password);

    return headers;
}

/**
 * Adds inputs for all strata that are not the location.
 * @param {StratumDefinition[]} fields List of strata in the study. The location stratum is not included.
 */
function addDynamicInputs(fields) {
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].type === "INTERVAL") {
            $("<div class='form-group'><label>" + fields[i].name + "</label><input type='number' class='form-control study-strata-param' id='" + fields[i].apiId + "' autocomplete='off'></div>").insertBefore("#hr-footer");
        } else if (fields[i].type === "ENUM") {
            let enumHTMLOptions = "<option></option>";
            for (const stratumValue of fields[i].values) {
                enumHTMLOptions += "<option value='" + stratumValue.apiId + "'>" + stratumValue.name + "</option>";
            }
            $("<div class='form-group'><label>" + fields[i].name + "</label><select class='form-control study-strata-param' id='" + fields[i].apiId + "'>" + enumHTMLOptions + "</div>").insertBefore("#hr-footer");
        }
    }

    document.querySelectorAll(".study-strata-param").forEach((element) => {
        element.addEventListener("input", () => hideRegisteredBeforeWarning())
    });
}

function setEventListeners() {
    $("#randimi-submit-button").click(function(event) {
        event.preventDefault();
        hideWarnings();
        sendRequest();
    });

    document.getElementById("registered-before-button").addEventListener("click", onViewPatient);

    document.getElementById("location").addEventListener("input", () => hideRegisteredBeforeWarning());
    document.getElementById("pseudonym").addEventListener("input", () => hideRegisteredBeforeWarning());
}

function hideWarnings() {
    $("#no-connection-warning").hide();
    $("#registered-before-warning").hide();
    $("#registered-before-warning-text").hide();
    $("#registered-before-warning-text-different-site").hide();
    $("#registered-before-warning-text-different-site-strata").hide();
    $("#registered-before-warning-text-different-strata").hide();
    $("#no-matching-arm-warning").hide();
}

function sendRequest() {
    randimi.lastRandomizationConflict = null;

    const studyStrataParams = {};
    $(".study-strata-param").each(function() {
        studyStrataParams[$(this).attr('id')] = $(this).attr("type") === "number" ? parseFloat($(this).val()) : $(this).val();
    });

    const requestBody = {};
    requestBody["siteApiId"] = $("#location").val();
    requestBody["pseudonym"] = $("#pseudonym").val();
    requestBody["studyStrataParams"] = studyStrataParams;

    const url = prepareUrl(randimi.randomizePatientUrl);

    $.ajax({
        url: url,
        type: "POST",
        headers: getHeaders(),
        contentType: "application/json",
        data: JSON.stringify(requestBody),
        dataType: "json",
        success: function(arm) {
            resolveArm(arm.subject);
        },
        error: function(error) {
            switch (error.status) {
                case 400:
                case 406:
                    $("#generic-warning p").text(error.responseJSON.detail);
                    $("#generic-warning").show();
                    break;
                case 409:
                    // The pseudonym is already registered, so show a warning
                    $("#registered-before-warning").show();

                    const errorDetails = error.responseJSON.details.existingSubject;
                    if (errorDetails != null) {
                        randimi.lastRandomizationConflict = errorDetails;

                        // Show the button to view the patient if the user has access to the DAG
                        if (randimi.userRights.group_id != null && randimi.userRights.group_id !== "") {
                            // If the user is assigned to a DAG, only show the button if the user has access to the patient's DAG.
                            if (randimi.userRights.group_id === errorDetails.site.apiId) {
                                document.getElementById("registered-before-button").style.display = "";
                            } else {
                                document.getElementById("registered-before-button").style.display = "none";
                            }
                        } else {
                            document.getElementById("registered-before-button").style.display = "";
                        }

                        // Show the message based on the similarities between the new patient and the existing patient
                        if (errorDetails.site.apiId !== $("#location").val()) {
                            if (doStratificationParameterMatch(errorDetails, studyStrataParams)) {
                                $("#registered-before-warning-text-different-site").show();
                            } else {
                                $("#registered-before-warning-text-different-site-strata").show();
                            }
                        } else {
                            if (doStratificationParameterMatch(errorDetails, studyStrataParams)) {
                                $("#registered-before-warning-text").show();
                            } else {
                                $("#registered-before-warning-text-different-strata").show();
                            }
                        }
                    } else {
                        $("#registered-before-warning-text").show();
                    }
                    break;
                default:
                    $("#no-connection-warning").show();
            }

            console.log("DEBUGGING - Error while randomizing patient:");
            console.log(error);
        }
    });
}

/**
 * Processes the randomization result.
 * @param {SubjectResource} result The randomization result.
 */
function resolveArm(result) {
    const arm = result.studyArm.apiId;

    for (const eventId in randimi.eventNames) {
        const eventName = randimi.eventNames[eventId]
        const armName = eventName.substring(eventName.lastIndexOf(": ") + 2, eventName.lastIndexOf(")"));

        if (arm.toLowerCase() === armName.toLowerCase()) {
            const form = Object.keys(randimi.instrumentNames)[0];
            window.location = randimi.appPathWebroot + "DataEntry/index.php?pid=" + randimi.projectId + "&event_id=" + eventId + "&id=" + result.pseudonym + "&page=" + form + "&site=" + result.site.apiId;
            return;
        }
    }

    $("#no-matching-arm-warning").show();
    console.log("DEBUGGING - Arm returned from RandIMI: " + arm);
    console.log("DEBUGGING - Arms specified within REDCap:");
    console.log(randimi.eventNames);
}

function processURLParameter() {
    var urlParams = new URLSearchParams(window.location.search);
    if (randimi.activateMainzellisteConnection && urlParams.has("pseudonym")) {
        $("#pseudonym").val(urlParams.get("pseudonym"));
        $("#pseudonym").prop("disabled", true);

        if (randimi.mainzellisteAutoSubmit) {
            $("#randimi-submit-button").prop("disabled", true);
            setTimeout(function() { sendRequest(); }, 1000);
        }
    } else if (randimi.activateMainzellisteConnection) {
        $("#mainzelliste-activated-warning").show();
        $("#randimi-submit-button").prop("disabled", true);

        setTimeout(function() { window.location = randimi.appPathWebroot + "ExternalModules?prefix=mainzelliste_integration&page=index&pid=" + randimi.projectId; }, 4000);
    }
}

// Internationalization
function internationalize() {
    for (var elementId in internationalization) {
        var element = $("#" + elementId);
        if (element != null) {
            element.text(internationalization[elementId][randimi.language]);
        }
    }
}

/**
 * Prepares the URL for API requests.
 * If using a tunnel, it appends the study ID as a query parameter.
 * Otherwise, replaces the placeholder in the URL.
 *
 * @param {string} url The URL to prepare.
 * @returns {string} The prepared URL.
 */
function prepareUrl(url) {
    if (randimi.useTunnel) {
        url += "&studyId=" + randimi.studyId;
    } else {
        url = url.replace("{studyApiId}", randimi.studyId);
    }
    return url;
}

/**
 * Fetches study resource from the RandIMI API.
 */
function fetchStudyResource() {
    const url = prepareUrl(randimi.getStudyUrl);

    $.ajax({
        url: url,
        type: "GET",
        headers: getHeaders(),
        success: function(studyResource) {
            validateStudySetup(studyResource);
            addDynamicInputs(studyResource.strata);
        },
        error: function(error) {
            console.log(error);
            $("#no-connection-warning").show();
        }
    });
}

/**
 * Validates if the REDCap project configuration fits the RandIMI study.
 * @param {StudyResource} studyResource The study resource data.
 */
function validateStudySetup(studyResource) {
    let hasErrors = false;

    // Validate study setup
    if (studyResource.pseudonymHandling !== "UNIQUE_IN_STUDY") {
        hasErrors = true;
        validationErrorPseudonymHandling();
    }

    // Validate study arms
    const redcapArms = Object.values(randimi.eventNames).map(eventName => eventName.substring(eventName.lastIndexOf(": ") + 2, eventName.lastIndexOf(")")));
    if (redcapArms.length !== studyResource.arms.length) {
        hasErrors = true;
        validationErrorArms(redcapArms, studyResource.arms.map(arm => arm.apiId));
    }
    for (const arm of studyResource.arms) {
        if (!redcapArms.includes(arm.apiId)) {
            hasErrors = true;
            validationErrorArms(redcapArms, studyResource.arms.map(arm => arm.apiId));
        }
    }

    // Validate DAGs
    const redcapSites = Object.keys(randimi.groupNames);
    if (redcapSites.length !== studyResource.sites.length) {
        hasErrors = true;
        validationErrorSites(redcapSites, studyResource.sites.map(dag => dag.apiId));
    }
    for (const dag of studyResource.sites) {
        if (!redcapSites.includes(dag.apiId)) {
            hasErrors = true;
            validationErrorSites(redcapSites, studyResource.sites.map(dag => dag.apiId));
        }
    }

    if (hasErrors) {
        // Disable the submit button
        document.getElementById("randimi-submit-button").disabled = true;
    }
}

/**
 * Shows validation error message for mismatching study arms.
 * @param {string[]} redcapArms Arms specified within REDCap.
 * @param {string[]} randimiArms Arms returned from RandIMI.
 */
function validationErrorArms(redcapArms, randimiArms) {
    // Update the warning message
    const textId = "validation-arms-do-not-match-text";
    let textContent = internationalization[textId][randimi.language];
    textContent = textContent.replace("$REDCAP_ARMS", redcapArms.join(", "));
    textContent = textContent.replace("$RANDIMI_ARMS", randimiArms.join(", "));
    const textElement = document.getElementById(textId)
    textElement.textContent = textContent;

    // Show the alert
    const alertId = "validation-arms-do-not-match";
    const alertElement = document.getElementById(alertId);
    alertElement.style.display = "";
}

function validationErrorPseudonymHandling() {
    // Show the alert
    const alertId = "validation-pseudonym-handling";
    const alertElement = document.getElementById(alertId);
    alertElement.style.display = "";
}

/**
 * Shows a validation error message for mismatching DAGs.
 * @param {string[]} redcapSites DAGs specified within REDCap.
 * @param {string[]} randimiSites Sites returned from RandIMI.
 */
function validationErrorSites(redcapSites, randimiSites) {
    // Update the warning message
    const textId = "validation-sites-do-not-match-text";
    let textContent = internationalization[textId][randimi.language];
    textContent = textContent.replace("$REDCAP_DAGS", redcapSites.join(", "));
    textContent = textContent.replace("$RANDIMI_SITES", randimiSites.join(", "));
    const textElement = document.getElementById(textId)
    textElement.textContent = textContent;

    // Show the alert
    const alertId = "validation-sites-do-not-match";
    const alertElement = document.getElementById(alertId);
    alertElement.style.display = "";
}

function onViewPatient() {
    if (randimi.lastRandomizationConflict != null) {
        resolveArm(randimi.lastRandomizationConflict);
    }
}

/**
 * Compares the stratification parameters of the new patient to the existing patient.
 * @param {SubjectResource} existingPatient The patient resource of the existing patient.
 * @param {Record<string, string>} studyStrataParams The stratification parameters of the new patient.
 * @returns {boolean} If the study strata parameters match the existing patient's strata parameters.
 */
function doStratificationParameterMatch(existingPatient, studyStrataParams) {
    for (const stratificationParameter of Object.keys(studyStrataParams)) {
        const existingParameter = existingPatient.stratificationParameters[stratificationParameter];
        const newParameter = studyStrataParams[stratificationParameter];

        if (existingParameter !== newParameter) {
            return false;
        }
    }

    return true;
}

/**
 * Hides the registered before warning.
 */
function hideRegisteredBeforeWarning() {
    $("#registered-before-warning").hide();
}

const internationalization = {
    "pseudonym-label": {
        "en_US": "Pseudonym",
        "de_DE": "Pseudonym"
    },
    "location-label": {
        "en_US": "Location",
        "de_DE": "Zentrum"
    },
    "randimi-submit-button": {
        "en_US": "Submit",
        "de_DE": "Absenden"
    },
    "generic-warning-title": {
        "en_US": "Warning",
        "de_DE": "Warnung"
    },
    "no-connection-warning-title": {
        "en_US": "No connection",
        "de_DE": "Keine Verbindung"
    },
    "no-connection-warning-text": {
        "en_US": "No connection could be established to the RandIMI server. Please check your configuration.",
        "de_DE": "Es konnte keine Verbindung zu dem RandIMI-Server hergestellt werden. Bitte überprüfen Sie Ihre Konfiguration."
    },
    "no-dag-warning-title": {
        "en_US": "No Data Access Groups",
        "de_DE": "Keine Zugriffsgruppen"
    },
    "no-dag-warning-text": {
        "en_US": "No Data Access Groups (DAGs) have been specified within REDCap. This module requires at least one DAG.",
        "de_DE": "In REDCap wurden bisher keine Zugriffsgruppen konfiguriert. Dieses Modul benötigt mindestens eine Zugriffsgruppe."
    },
    "registered-before-warning-title": {
        "en_US": "Patient registered before",
        "de_DE": "Patient schon registriert"
    },
    "registered-before-warning-text": {
        "en_US": "This Patient has been registered before.",
        "de_DE": "Dieser Patient wurde bereits registriert."
    },
    "registered-before-warning-text-different-site": {
        "en_US": "A Patient with the same pseudonym has already been registered at a different site.",
        "de_DE": "Ein Patient mit dem gleichen Pseudonym wurde bereits bei einem anderen Standort registriert."
    },
    "registered-before-warning-text-different-site-strata": {
        "en_US": "A Patient with the same pseudonym has already been registered at a different site and with different stratification parameters.",
        "de_DE": "Ein Patient mit dem gleichen Pseudonym wurde bereits bei einem anderen Standort und mit anderen Stratifizierungsparametern registriert."
    },
    "registered-before-warning-text-different-strata": {
        "en_US": "A Patient with the same pseudonym has been registered before with different stratification parameters.",
        "de_DE": "Ein Patient mit dem gleichen Pseudonym wurde bereits mit anderen Stratifizierungsparametern registriert."
    },
    "no-matching-arm-warning-title": {
        "en_US": "No matching arm",
        "de_DE": "Kein entsprechender Arm"
    },
    "no-matching-arm-warning-text": {
        "en_US": "No matching arm could be found. Please ensure that you named the study arms within REDCap exactly as in the RandIMI configuration. The returned arm from RandIMI and the arm names within REDCap were printed to the console for debugging.",
        "de_DE": "Es konnte kein entsprechender Studienarm gefunden werden. Bitte stellen Sie sicher, dass Sie die Studienarme in REDCap genau so benannt haben wie in der RandIMI-Konfiguration. Der zurückgegebene Arm von RandIMI und die Arme in REDCap wurden in der Konsole ausgegeben um die Fehlersuche zu vereinfachen."
    },
    "mainzelliste-activated-warning-title": {
        "en_US": "Connection to Mainzelliste active",
        "de_DE": "Verbindung zur Mainzelliste ist aktiv"
    },
    "mainzelliste-activated-warning-text": {
        "en_US": "The connection to the Mainzelliste Integration module has been activated in the configuration. You will be therefore redirected to the Mainzelliste.",
        "de_DE": "Die Verbindung zum Mainzelliste Integration Modul wurde in der Konfiguration aktiviert. Sie werden daher zur Mainzelliste umgeleitet."
    },
    "validation-arms-do-not-match-title": {
        "en_US": "Validation failed",
        "de_DE": "Validierung fehlgeschlagen"
    },
    "validation-arms-do-not-match-text": {
        "en_US": `Arms specified within REDCap ($REDCAP_ARMS) do not match the arms specified in RandIMI ($RANDIMI_ARMS).`,
        "de_DE": "Arme in REDCap ($REDCAP_ARMS) stimmen nicht mit den Armen in RandIMI ($RANDIMI_ARMS) überein."
    },
    "validation-pseudonym-handling-title": {
        "en_US": "Validation failed",
        "de_DE": "Validierung fehlgeschlagen"
    },
    "validation-pseudonym-handling-text": {
        "en_US": "Pseudonyms must be configured as \"Unique in Study\" in RandIMI.",
        "de_DE": "Die Pseudonyme müssen in RandIMI als \"Einzigartig in Studie\" konfiguriert sein."
    },
    "validation-sites-do-not-match-title": {
        "en_US": "Validation failed",
        "de_DE": "Validierung fehlgeschlagen"
    },
    "validation-sites-do-not-match-text": {
        "en_US": `DAGs specified within REDCap ($REDCAP_DAGS) do not match the sites specified in RandIMI ($RANDIMI_SITES).`,
        "de_DE": "DAGs in REDCap ($REDCAP_DAGS) stimmen nicht mit den Standorten in RandIMI ($RANDIMI_SITES) überein."
    },
};
