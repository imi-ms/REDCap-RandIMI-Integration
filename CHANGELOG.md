# Changelog

All notable changes to this project will be documented in this file.

## 1.7.1
- Fixed missing CSRF token when using the REDCap tunnel [(#1)](https://github.com/imi-ms/REDCap-RandIMI-Integration/issues/1)
- Fixed some warnings not being hidden after form resubmission [(#2)](https://github.com/imi-ms/REDCap-RandIMI-Integration/issues/2)

## 1.7.0
- Requires RandIMI API v2
- Validate study setup in RandIMI when opening the randomization page
- Automatically set DAG after redirecting to the REDCap form
- Replaced automatic redirect on conflicts with a manual button click
- Fixed redirect to form not using the returned pseudonym but the input value
- Fixed redirect to form if multiple forms are available
- Improved error messages
- Fixed language is ignored when using the REDCap tunnel
- Updated setup, authors, and citation in README

## 1.5
- In case of REDCap as a proxy, the project language will be used instead of the browser languae

## 1.4

- When using the REDCap server as a proxy, set the basic auth header for RandIMI on the backend
- New option to replace the add / edit record button with a custom RandIMI button

## 1.3

- Added option to use the REDCap server as a proxy to tunnel all client requests

## 1.2

- Display some specific error messages returned by RandIMI

## 1.1

- Retrieve assignment of already registered patients

## 1.0

- Initial release
