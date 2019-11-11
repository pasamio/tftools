avahi-browse -rpt _tapforms-sync._tcp | grep -e '^=' | grep IPv4 | awk -F';' '{printf "https://%s:%s/%s\n", $8, $9, $4 }' | sed -e's/\\064[^ ]*//' > /tmp/tf-hosts
