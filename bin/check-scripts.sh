for SCRIPTURL in $(jq -r '.[].versions[].url' index.json ); do curl -s -f -o /dev/null $SCRIPTURL; echo -e "$?\t$SCRIPTURL"; done
