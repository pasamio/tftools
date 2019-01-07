# Build Tree

This script, named `build-tree.php`, will connect to the CouchDB
instance and dump out the tree of all configured databases on the
system. This is useful during script development to be able to
get a full list of the internal field identifiers for use with
`getFieldValue` and similar commands. Assuming you have the basic
configuration set up, you can run `./build-tree.php` to get a
listing of all documents, forms and their fields.



