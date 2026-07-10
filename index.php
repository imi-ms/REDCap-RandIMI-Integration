<?php
    require_once APP_PATH_DOCROOT . "ProjectGeneral/header.php";


    $groupNames = REDCap::getGroupNames(false);
    $userName = strtolower(USERID);
    $userRights = REDCap::getUserRights($userName)[$userName];
    $eventNames = REDCap::getEventNames(false, true);
	$instruments = REDCap::getInstrumentNames();

	$csrfToken = $module->getCSRFToken();
    $language = $module->getProjectSetting("language");
    $serverUrl = $module->getProjectSetting("server-url");
    $studyId = $module->getProjectSetting("study-id");
    $username = $module->getProjectSetting("username");
    $password = $module->getProjectSetting("password");
    $useTunnel = $module->getProjectSetting("use-tunnel");
    $activateMainzellisteConnection = $module->getProjectSetting("activate-mainzelliste-connection");
    $mainzellisteAutoSubmit = $module->getProjectSetting("mainzelliste-auto-submit");

    if ($useTunnel) {
		$getStudyUrl = $module->getUrl("php/getStudy.php");
        $randomizePatientUrl = $module->getUrl("php/randomizePatient.php");
    } else {
		$getStudyUrl = $serverUrl . "/v2/study/{studyApiId}";
        $randomizePatientUrl = $serverUrl . "/v2/study/{studyApiId}/subject";
    }
?>

<link href="<?php echo $module->getUrl('css/style.css')?>" rel="stylesheet">
<script src="<?php echo $module->getUrl('js/app.js')?>"></script>
<script>
    // Use of a single global scope object to prevent conflicts with other modules
    var randimi = {};

    randimi.appPathWebroot = <?php echo json_encode(APP_PATH_WEBROOT)?>;
    randimi.csrfToken = <?php echo json_encode($csrfToken)?>;
    randimi.projectId = <?php echo json_encode($project_id)?>;

    randimi.groupNames = <?php echo json_encode($groupNames)?>;
    randimi.userRights = <?php echo json_encode($userRights)?>;
    randimi.eventNames = <?php echo json_encode($eventNames)?>;
    randimi.instrumentNames = <?php echo json_encode($instruments)?>;

    randimi.language = <?php echo json_encode($language)?>;
    randimi.studyId = <?php echo json_encode($studyId)?>;
    randimi.useTunnel = <?php echo json_encode($useTunnel)?>;
    if (!randimi.useTunnel) randimi.username = <?php echo json_encode($username)?>;
    if (!randimi.useTunnel) randimi.password = <?php echo json_encode($password)?>;
    randimi.activateMainzellisteConnection = <?php echo json_encode($activateMainzellisteConnection)?>;
    randimi.mainzellisteAutoSubmit = <?php echo json_encode($mainzellisteAutoSubmit)?>;

    randimi.getStudyUrl = <?php echo json_encode($getStudyUrl)?>;
    randimi.randomizePatientUrl = <?php echo json_encode($randomizePatientUrl)?>;

    randimi.lastRandomizationConflict = null;
</script>

<form id="randimi-form">
    <?php
        echo "<h3 id='randimi-header'>RandIMI</h3>";
        echo "<hr id='hr-header'>";
        echo "<hr id='hr-footer'>";
        echo "<button class='btn btn-primaryrc' id='randimi-submit-button'>Submit</button>";
    ?>

<div id="generic-warning" class="alert alert-warning" style="display: none;">
        <strong id="generic-warning-title">Warning</strong>
        <br><br>
        <p id="generic-warning-text"></p>
    </div>

    <div id="no-connection-warning" class="alert alert-warning" style="display: none;">
        <strong id="no-connection-warning-title">No connection</strong>
        <br><br>
        <p id="no-connection-warning-text">No connection could be established to the RandIMI server. Please check your configuration.</p>
    </div>

    <div id="no-dag-warning" class="alert alert-warning" style="display: none;">
        <strong id="no-dag-warning-title">No Data Access Groups</strong>
        <br><br>
        <p id="no-dag-warning-text">No Data Access Groups (DAGs) have been specified within REDCap. This module requires at least one DAG.</p>
    </div>

    <div id="registered-before-warning" class="alert alert-warning" style="display: none;">
        <strong id="registered-before-warning-title">Patient registered before</strong>
        <br><br>
        <p id="registered-before-warning-text" style="display: none;"></p>
	    <p id="registered-before-warning-text-different-site" style="display: none;"></p>
	    <p id="registered-before-warning-text-different-strata" style="display: none;"></p>
	    <p id="registered-before-warning-text-different-site-strata" style="display: none;"></p>
	    <br>
	    <button id="registered-before-button" class="btn btn-primaryrc" type="button">View Patient</button>
    </div>

    <div id="no-matching-arm-warning" class="alert alert-warning" style="display: none;">
        <strong id="no-matching-arm-warning-title">No matching arm</strong>
        <br><br>
        <p id="no-matching-arm-warning-text">No matching arm could be found. Please ensure that you named the study arms within REDCap exactly as in the RandIMI configuration. The returned arm from RandIMI and the arm names within REDCap were printed to the console for debugging.</p>
    </div>

    <div id="mainzelliste-activated-warning" class="alert alert-warning" style="display: none;">
        <strong id="mainzelliste-activated-warning-title">Connection to Mainzelliste active</strong>
        <br><br>
        <p id="mainzelliste-activated-warning-text">The connection to the Mainzelliste Integration module has been activated in the configuration. You will be therefore redirected to the Mainzelliste.</p>
    </div>

	<!-- Warnings from the project validation -->
	<div id="validation-pseudonym-handling" class="alert alert-danger" style="display: none;">
		<strong id="validation-pseudonym-handling-title"></strong>
		<br>
		<p id="validation-pseudonym-handling-text"></p>
	</div>
	<div id="validation-arms-do-not-match" class="alert alert-danger" style="display: none;">
		<strong id="validation-arms-do-not-match-title"></strong>
		<br>
		<p id="validation-arms-do-not-match-text"></p>
	</div>
	<div id="validation-sites-do-not-match" class="alert alert-danger" style="display: none;">
		<strong id="validation-sites-do-not-match-title"></strong>
		<br>
		<p id="validation-sites-do-not-match-text"></p>
	</div>

</form>
