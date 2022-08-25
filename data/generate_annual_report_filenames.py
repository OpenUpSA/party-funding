import json
from datetime import datetime
from pathlib import Path


repo_path = Path(__file__).resolve().parents[1]
out_base_path = repo_path / "data/out"


def generate_annual_report_filenames():
    "Create list of annual report links for website"
    start_year = 2000
    result = []
    dir_path = Path("annual-reports")
    for year in range(start_year, datetime.now().year + 1):
        report_path = dir_path / f"NLC Annual Report {year}.zip"
        if report_path.exists() is False:
            report_path = dir_path / f"annual_report_{year}.pdf"
        if report_path.exists() is False:
            report_path = dir_path / f"annual_report_{year}_{year + 1}.pdf"
        if report_path.exists() is True:
            result.append({"year": year, "filename": report_path.name})
        else:
            print(f"No annual report found for year {year}")
    out_path = out_base_path / "annual-report-filenames.json"
    with out_path.open("w") as file:
        json.dump(result, file, indent=2)


generate_annual_report_filenames()
