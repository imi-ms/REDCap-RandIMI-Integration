<?php
namespace IMIREDCapModules\RandIMIIntegration;

class RandIMIIntegration extends \ExternalModules\AbstractExternalModule {
    function redcap_module_link_check_display($project_id, $link) {
        return true;
    }

    // When the option to show a custom RandIMI button on the Add / Edit Records and Record Status Dashboard pages is activated,
    // the following two functions remove the REDCap buttons or inputs and add the own custom buttom
    function redcap_add_edit_records_page($project_id, $instrument, $event_id) {
        if (!$this->getProjectSetting("add-edit-button")) {
            return;
        }

        $customButtonText = $this->getProjectSetting("custom-add-edit-button-text");
        $buttonText = ($customButtonText ? $customButtonText : "RandIMI");
        ?>

        <script>
            $(document).ready(function() {
                if ($("#center .form_border .data button").length) {
                    $('<button id="add-edit-randimi-button" class="btn btn-xs btn-rcgreen fs13"><?php echo $buttonText; ?></button>').insertAfter("#center .form_border .data button");
                    $("#center .form_border .data button:first").remove();
                } else if ($("#center .form_border .data #inputString").length) {
                    $('<button id="add-edit-randimi-button" class="btn btn-xs btn-rcgreen fs13"><?php echo $buttonText; ?></button>').insertAfter("#center .form_border .data #inputString");
                    $("#center .form_border .data #inputString").remove();
                }

                if ($("#add-edit-randimi-button")) {
                    $("#add-edit-randimi-button").click(function() {
                        window.location = "https://<?php echo SERVER_NAME.APP_PATH_WEBROOT; ?>ExternalModules/?prefix=randimi_integration&page=index&pid=<?php echo $project_id; ?>";
                    });
                }
            });
        </script>

        <?php
    }

    // Since REDCap 9, there is a Add New Record button on the Record Status Dashboard
    // Since there is no redcap_record_status_dashboard hook available, redcap_every_page_top must be used to access the Record Status Dashboard
    function redcap_every_page_top($project_id) {
	    if (PAGE == "DataEntry/index.php") {
		    // Select the correct site in the dropdown
		    ?>
		    <script>
                $(document).ready(function() {
                    const params = new URLSearchParams(window.location.search);
                    let site = params.get("site");
                    if (site == null) {
                        return;
                    }

                    const dagSelect = document.getElementsByName("__GROUPID__")[0];
                    if (dagSelect) {
                        dagSelect.value = site;
                    }
                });
		    </script>
		    <?php
	    }

        if (!$this->getProjectSetting("add-edit-button")) {
            return;
        }

        $customButtonText = $this->getProjectSetting("custom-add-edit-button-text");
        $buttonText = ($customButtonText ? $customButtonText : "RandIMI");

        if (PAGE == "DataEntry/record_status_dashboard.php") {
            ?>
            <script>
                $(document).ready(function() {
                    if ($("#center .mb-3 button").length) {
                        $('<button id="add-edit-randimi-button" class="btn btn-xs btn-rcgreen fs13"><?php echo $buttonText; ?></button>').insertAfter("#center .mb-3 button");
                        $("#center .mb-3 button:first").remove();
                    } else if ($("#center .mb-4 .input-group-append").length) {
                        $('<button id="add-edit-randimi-button" class="btn btn-xs btn-rcgreen fs13"><?php echo $buttonText; ?></button>').insertAfter("#center .mb-4 .input-group-append");
                        $("#center .mb-4 #inputString").remove();
                        $("#center .mb-4 .input-group-append").remove();
                    }

                    if ($("#add-edit-randimi-button")) {
                        $("#add-edit-randimi-button").click(function() {
                            window.location = "https://<?php echo SERVER_NAME.APP_PATH_WEBROOT; ?>ExternalModules/?prefix=randimi_integration&page=index&pid=<?php echo $project_id; ?>";
                        });
                    }
                });
            </script>

            <?php
        }
    }
}
