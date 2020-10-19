// Small Script to delete all records and scripts from Script Manager.
let smForm = document.getFormNamed('Script Manager');
smForm.getRecords().forEach(rec => smForm.deleteRecord(rec));
smForm.getScripts().forEach(script => smForm.deleteScriptWithId(script.getId()));
document.saveAllChanges();
