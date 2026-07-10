<?php
    define("RANDIMI_BASE_URL", $module->getProjectSetting("server-url"));
    define("RANDIMI_USERNAME", $module->getProjectSetting("username"));
    define("RANDIMI_PASSWORD", $module->getProjectSetting("password"));
    define("RANDIMI_LANGUAGE", $module->getProjectSetting("language"));

    // Fetch new arm assignment
    $url = RANDIMI_BASE_URL . "/v2/study/" . $_GET["studyId"] . "/subject";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_USERPWD, RANDIMI_USERNAME . ":" . RANDIMI_PASSWORD);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HTTP200ALIASES, (array)400);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json", "Accept-Language: " . RANDIMI_LANGUAGE));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST["randimi_data"]);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    header("Content-Type: " . $contentType);
    http_response_code($httpcode);

    echo $response;
?>
