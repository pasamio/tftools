# ElasticSearch

One of the capabilities is the ability to propagate the changes from
your Tap Forms database into an ElasticSearch index that can be
accessed via Kibana to visualise your data.

| Option Name | Default | Description |
| ----------- | ------- | ----------- |
| esIndex | test | ElasticSearch index name to use for this database. |
| esHost | `http://localhost:9200` | Hostname details for ElasticSearch server. |


To run this, set up `get-changes.php` to run regularly via `crontab -e`:

```
# Update ElasticSearch from the other databases once an hour.
@hourly php /path/to/tftools/get-changes.php > /tmp/tf-couchdb-es-sync.log 2>&1
```

The script will then use the configuration options to push changes
from CouchDB over to the ElasticSearch instance.
