<?php
define("RANDIMI_BASE_URL", $module->getProjectSetting("server-url"));
define("RANDIMI_USERNAME", $module->getProjectSetting("username"));
define("RANDIMI_PASSWORD", $module->getProjectSetting("password"));
define("RANDIMI_LANGUAGE", $module->getProjectSetting("language"));

// Fetch study info
$url = RANDIMI_BASE_URL . "/v2/study/" . $_GET["studyId"];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_USERPWD, RANDIMI_USERNAME . ":" . RANDIMI_PASSWORD);
curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept-Language: " . RANDIMI_LANGUAGE));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
curl_close($ch);

header("Content-Type: application/json");
echo $response;
?>
