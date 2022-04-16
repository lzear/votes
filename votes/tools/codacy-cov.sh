#!/bin/bash

bash <(curl -Ls https://coverage.codacy.com/get.sh) report -r ./coverage/lcov.info --project-token "$CODACY_PROJECT_TOKEN"
