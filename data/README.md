# Party funding data processing

See `process.sh` for what should be run to generate outputs.

`data/name-resolution.json` is used to collapse variants of a beneficiary's name to a single value. Entries created in `data/name-resolution-tmp.json` during `transform.py` runs can be used as starting point for specifying hard-coded mappings / overrides in `data/name-resolution.json`.
