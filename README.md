# Party funding

This repo provides data processing from source CSV files, and a website to explore Party funding.

## TODO

- [ ] Avoid CSS `//` comments from webflow or post-process in webflow import. @Matt ?
- [ ] Show all time top 10 beneficiaries by amount on website
- [ ] Change processing of input CSV data so that Netlify deployment can generate data?
- [ ] Figure out date types (allocation etc?) and include in popup table

## Development

Data processing is done using Python, website UX design in Webflow, and website dynamics using jQuery and D3.js.

### Generate data from CSV files

A Python virtual environment may be used as follows (run commands from `data` directory):

- For first time setup, run `. install.sh`. This installs and activates a Python virtual environment.
- To activate the virtual environment, run `. activate.sh`.
- To deactivate virtual environment, run `deactivate`.

To generate data for the website, save CSV files to `/data/in/*{year}*.csv`, for example `/data/in/NLC-2001-2002 - cleaned.csv`, then:

```bash
cd data
python transform.py
```

TODO: Manual actions (to be fixed at source):

- `NLC-2003-2004 - cleaned2.csv` - header row 'Name,Sector,Province,Amount' moved from line 180 to line 1
- `not_in_official 2017-2018.csv` - changed '-' amount to '0' in line '2018-02-28T00:00:00Z,90138,"SITHEMBIMFUNDO CRECHE & PRE",-' and changed column 'Organisation' to 'Name'


### Import Webflow export

To update the website with a Webflow export, save the Webflow export to `/webflow-export.zip`, then run:

```bash
npm run webflow-import
```

## Deployment

Commits to `main` are deployed to [party-funding.netlify.app](https://party-funding.netlify.app) by [Netlify](https://app.netlify.com/sites/party-funding).

Building of changes from `data/in` is including in the Netlify build, so this needs to be done manually and committed:

```bash
cd data
. activate.sh
python transform.py
```

This process should of course be improved once the data processing is finalised.
