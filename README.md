# RandIMI Integration Documentation

## Introduction
The aim of this module is to integrate a running RandIMI instance into REDCap in order to facilitate the work with randomized clinical trials. This module provides an easy to use interface to the RandIMI service, handles all communication with it, and redirects the user automatically to a patients record page based on the resulting study arm returned by the RandIMI service.

## Installation
You can either install the module via the [REDCap Repository of External Modules](https://redcap.vanderbilt.edu/consortium/modules/index.php) (recommended) or by downloading all files from this Git repository and moving them to the `redcap/modules/randimi_integration_v1.0` directory manually. Please note that `v1.0` is just stated as an example, you can find the current version number [here](CHANGELOG.md). After that, you need to enable the module in the REDCap Control Center for your REDCap instance and for each project you want to use it with:
1. For the REDCap instance: `REDCap My Projects overview page -> Control Center -> External Modules -> Enable a module -> RandIMI Integration -> Enable`
2. For a REDCap project: `Open REDCap project -> External Modules -> Enable a module -> RandIMI Integration -> Enable`

In order to upgrade your RandIMI Integration module, simply follow the same steps as above.


## Configuration
After enabling the module, you need to configure it to your RandIMI instance. In your project, go to `External Modules -> RandIMI Integration -> Configure`. In the first field you can change the language of the rendered form that is used to access the RandIMI service. Currently, English and German are the supported languages. In the second field you need to specify the base URL of the RandIMI server. The third field takes the Study ID that you get from the RandIMI service. The fourth and fifth fields take the username and password for authentication. They were specified during the study setup in RandIMI.

Please ensure that the names of both the Data Access Groups and Arms within REDCap are the same as specified within RandIMI. Otherwise a successful matching of these cannot take place.

Additional stratifying fields that were configured within RandIMI do not have to be configured. The module queries these automatically and renders them accordingly.


## Setup REDCap and RandIMI project

1. Create DAGs for every site in the study. In RandIMI, set the site API ID to the `Group ID number` of the DAG
2. Enable `Setup -> Use longitudinal data collection with defined events`
3. Under `Setup -> Define My Events`
	1. The arm names must match the API ID specified within RandIMI
	2. Ensure that every arm has an event; the name does not matter
4. Under `Setup -> Define My Events -> Designate Instruments for My Events`
	1. Select the event on each arm by clicking `Begin Editing -> Check event -> Save`
5. In RandIMI, ensure the setting for pseudonym handling is set to "Unique in study"


## Usage
After the configuration, the module can be used by opening the `RandIMI` page that appears in the left hand menu within REDCap under `External Modules`.

## Authors

* **Daniel Preciado-Marquez** *(This repository, RandIMI)* | +49 (251) 83 52646 +49 | daniel.preciado-marquez@uni-muenster.de
* **Leonard Greulich** *(This repository)* | +49 (251) 83-54730 | leonard.greulich@uni-muenster.de
* **Tobias Brix** *(RandIMI)* | +49 (251) 83-52526 | tobias.brix@uni-muenster.de
* **Tobias Hardt** *(RandIMI)* | tobiashardt@uni-muenster.de
* **Paul Schaub** *(RandIMI)*

## Citation

Please cite the following article: [https://pubmed.ncbi.nlm.nih.gov/34042814/](https://pubmed.ncbi.nlm.nih.gov/34042814/)

## License

This project is licensed under the MIT License — see the [LICENSE.md](LICENSE.md) file for details.
