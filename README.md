# MVC Party Funding

This repo provides data processing from source CSV files, and a website to explore party funding.

Adapted from the [SA Lottery Grants](https://github.com/OpenUpSA/lottery-grants/) tool.

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

To generate data for the website, save CSV files to `/data/in/*{year}*.csv`, for example `/data/in/2002-cleaned.csv`, then:

```bash
cd data
python transform.py
```

### Import Webflow export

Do not re-import from Webflow as manual changes have been made here.

## Deployment

Commits to `main` are deployed to [mvc-party-funding.openup.org.za](https://mvc-party-funding.openup.org.za/) by [Netlify](https://app.netlify.com/sites/mvc-party-funding).

Building of changes from `data/in` is including in the Netlify build, so this needs to be done manually and committed:

```bash
cd data
. activate.sh
python transform.py
```

This process should of course be improved once the data processing is finalised.
