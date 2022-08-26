"Generate data summmaries from cleaned data per year at in/*.csv"
import csv
import json
import re
import sys
from pathlib import Path
import pandas as pd


def normalize_beneficiary_name(value):
    '''Transform name to display'''
    value = re.sub(u"(\u2018|\u2019)", '', value)
    value = re.sub(u"(\u2013)", '-', value)
    value = re.sub(u"(\u2013)", '-', value)
    value = value.replace('_', ' ')
    value = value.replace(',', ', ')
    value = ' '.join(value.split())
    return value


def resolve_name(value):
    '''Collapse name to single lookup name'''
    value = normalize_beneficiary_name(value)
    value_resolve = value.upper()
    value_resolve = value_resolve.replace("'", '').replace('`', '')
    value_resolve = value_resolve.replace(' - ', ' ')
    value_resolve = value_resolve.replace(',', '')
    value_resolve = value_resolve.replace(',', '')
    value_resolve = value_resolve.replace('_', '')
    value_resolve = value_resolve.replace('AND', '&')
    return value_resolve


fields = ["Date", "Project Number", "Sector", "Province", "Name", "Amount"]
mandatory_fields = ["Name"]
forced_fields = set(["Sector"])

totals = [["name"], ["sector"], ["province"], ["year", "sector", "name"]]

UNSPECIFIED = 'UNSPECIFIED'

province_names = {
    UNSPECIFIED: UNSPECIFIED,
    "National": "National",
}

provinces = {
    "Unknown": UNSPECIFIED,
    "National": "National",
}

sector_names = {
    "UNSPECIFIED": UNSPECIFIED,
    "Firestation Asset Management (Pty) Ltd": "Firestation Asset Management (Pty) Ltd",
    "African Equity Corporation Pty Ltd": "African Equity Corporation Pty Ltd",
    "Black Like Me (Pty) Ltd": "Black Like Me (Pty) Ltd",
    "Brahman Hills Proprietary limited": "Brahman Hills Proprietary limited",
    "Firestation Asset Management (Pty) Ltd": "Firestation Asset Management (Pty) Ltd",
    "Jesicca Slack-Jell": "Jesicca Slack-Jell",
    "Kaggen Investment": "Kaggen Investment",
    "Konrad-Adenauer-Stiftung E.V": "Konrad-Adenauer-Stiftung E.V",
    "Martin Moshal": "Martin Moshal",
    "Moxitone Investments Pty Ltd": "Moxitone Investments Pty Ltd",
    "Pty Props 274 (Pty) Ltd": "Pty Props 274 (Pty) Ltd",
    "Rebecca Oppenheimer": "Rebecca Oppenheimer",
    "Style Eyes of Carlifonia (PTY) LTD": "Style Eyes of Carlifonia (PTY) LTD",
    "The Shave and Gibson Foundation": "The Shave and Gibson Foundation",
    "Victoria Freudenheim": "Victoria Freudenheim",
    "Mkhuseli Jack Investment Trust": "Mkhuseli Jack Investment Trust",
    "Sakhumzi Justice Macozoma": "Sakhumzi Justice Macozoma",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Batho Batho": "Batho Batho",
    "Cedric Muziwakhile Ntombela": "Cedric Muziwakhile Ntombela",
    "Chancellor House Trust": "Chancellor House Trust",
    "Discovery Central Services": "Discovery Central Services",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "Majestic Silver Trading 40 (Pty) Ltd": "Majestic Silver Trading 40 (Pty) Ltd",
    "Matamela Ramaphosa Cyril": "Matamela Ramaphosa Cyril",
    "Mr Cedric M Ntombela": "Mr Cedric M Ntombela",
    "Mr L Sibiya": "Mr L Sibiya",
    "Naspers Ltd": "Naspers Ltd",
    "Nep Consulting Engeneers Pty Ltd": "Nep Consulting Engeneers Pty Ltd",
    "Nonkwelo Investment Holdings": "Nonkwelo Investment Holdings",
    "Tyeks Security": "Tyeks Security",
    "United Manganese Of Kalahari": "United Manganese Of Kalahari",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "B & J Steenberg Engineering": "B & J Steenberg Engineering",
    "Charles Liasides": "Charles Liasides",
    "Danish Liberal Democracy Programme": "Danish Liberal Democracy Programme",
    "Discovery Central Services": "Discovery Central Services",
    "Friedrich Naumann Foundation": "Friedrich Naumann Foundation",
    "Fynbos Ekwiteit (Pty) Ltd": "Fynbos Ekwiteit (Pty) Ltd",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "Jacques Plaut": "Jacques Plaut",
    "Karl Leinberger": "Karl Leinberger",
    "Longlands Village (Pty) Ltd": "Longlands Village (Pty) Ltd",
    "Martin Moshal": "Martin Moshal",
    "Mr Jody Scheckter": "Mr Jody Scheckter",
    "Ms Mary Slack": "Ms Mary Slack",
    "Naspers Ltd": "Naspers Ltd",
    "Nicholas Frank Oppenheimer": "Nicholas Frank Oppenheimer",
    "Polyoak Packaging (Pty) Ltd": "Polyoak Packaging (Pty) Ltd",
    "Sandy Van Hoogstraten": "Sandy Van Hoogstraten",
    "Sir Michael Lawrence Davis": "Sir Michael Lawrence Davis",
    "The Chandos Trust": "The Chandos Trust",
    "The South African Breweries Pty Ltd": "The South African Breweries Pty Ltd",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "Mr SN Maseko": "Mr SN Maseko",
    "The South African Breweries Pty Ltd": "The South African Breweries Pty Ltd",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "SI Africa Solutions": "SI Africa Solutions",
    "South African Law School": "South African Law School",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Counterpoint Trading 156": "Counterpoint Trading 156",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "Gayton Mckenzie": "Gayton Mckenzie",
    "Institute Of Commerce & Management SA": "Institute Of Commerce & Management SA",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd"
}
sectors = {
    "": "UNSPECIFIED",
    "UNSPECIFIED": "UNSPECIFIED",
    "Firestation Asset Management (Pty) Ltd": "Firestation Asset Management (Pty) Ltd",
    "African Equity Corporation Pty Ltd": "African Equity Corporation Pty Ltd",
    "Black Like Me (Pty) Ltd": "Black Like Me (Pty) Ltd",
    "Brahman Hills Proprietary limited": "Brahman Hills Proprietary limited",
    "Firestation Asset Management (Pty) Ltd": "Firestation Asset Management (Pty) Ltd",
    "Jesicca Slack-Jell": "Jesicca Slack-Jell",
    "Kaggen Investment": "Kaggen Investment",
    "Konrad-Adenauer-Stiftung E.V": "Konrad-Adenauer-Stiftung E.V",
    "Martin Moshal": "Martin Moshal",
    "Moxitone Investments Pty Ltd": "Moxitone Investments Pty Ltd",
    "Pty Props 274 (Pty) Ltd": "Pty Props 274 (Pty) Ltd",
    "Rebecca Oppenheimer": "Rebecca Oppenheimer",
    "Style Eyes of Carlifonia (PTY) LTD": "Style Eyes of Carlifonia (PTY) LTD",
    "The Shave and Gibson Foundation": "The Shave and Gibson Foundation",
    "Victoria Freudenheim": "Victoria Freudenheim",
    "Mkhuseli Jack Investment Trust": "Mkhuseli Jack Investment Trust",
    "Sakhumzi Justice Macozoma": "Sakhumzi Justice Macozoma",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Batho Batho": "Batho Batho",
    "Cedric Muziwakhile Ntombela": "Cedric Muziwakhile Ntombela",
    "Chancellor House Trust": "Chancellor House Trust",
    "Discovery Central Services": "Discovery Central Services",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "Majestic Silver Trading 40 (Pty) Ltd": "Majestic Silver Trading 40 (Pty) Ltd",
    "Matamela Ramaphosa Cyril": "Matamela Ramaphosa Cyril",
    "Mr Cedric M Ntombela": "Mr Cedric M Ntombela",
    "Mr L Sibiya": "Mr L Sibiya",
    "Naspers Ltd": "Naspers Ltd",
    "Nep Consulting Engeneers Pty Ltd": "Nep Consulting Engeneers Pty Ltd",
    "Nonkwelo Investment Holdings": "Nonkwelo Investment Holdings",
    "Tyeks Security": "Tyeks Security",
    "United Manganese Of Kalahari": "United Manganese Of Kalahari",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "B & J Steenberg Engineering": "B & J Steenberg Engineering",
    "Charles Liasides": "Charles Liasides",
    "Danish Liberal Democracy Programme": "Danish Liberal Democracy Programme",
    "Discovery Central Services": "Discovery Central Services",
    "Friedrich Naumann Foundation": "Friedrich Naumann Foundation",
    "Fynbos Ekwiteit (Pty) Ltd": "Fynbos Ekwiteit (Pty) Ltd",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "Jacques Plaut": "Jacques Plaut",
    "Karl Leinberger": "Karl Leinberger",
    "Longlands Village (Pty) Ltd": "Longlands Village (Pty) Ltd",
    "Martin Moshal": "Martin Moshal",
    "Mr Jody Scheckter": "Mr Jody Scheckter",
    "Ms Mary Slack": "Ms Mary Slack",
    "Naspers Ltd": "Naspers Ltd",
    "Nicholas Frank Oppenheimer": "Nicholas Frank Oppenheimer",
    "Polyoak Packaging (Pty) Ltd": "Polyoak Packaging (Pty) Ltd",
    "Sandy Van Hoogstraten": "Sandy Van Hoogstraten",
    "Sir Michael Lawrence Davis": "Sir Michael Lawrence Davis",
    "The Chandos Trust": "The Chandos Trust",
    "The South African Breweries Pty Ltd": "The South African Breweries Pty Ltd",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "Mr SN Maseko": "Mr SN Maseko",
    "The South African Breweries Pty Ltd": "The South African Breweries Pty Ltd",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "SI Africa Solutions": "SI Africa Solutions",
    "South African Law School": "South African Law School",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Counterpoint Trading 156": "Counterpoint Trading 156",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd",
    "3sixty Health Solutions": "3sixty Health Solutions",
    "Gayton Mckenzie": "Gayton Mckenzie",
    "Institute Of Commerce & Management SA": "Institute Of Commerce & Management SA",
    "African Rainbow Minerals Ltd": "African Rainbow Minerals Ltd",
    "Harmony Gold Mining Company Ltd": "Harmony Gold Mining Company Ltd"
}

repo_path = Path(__file__).resolve().parents[1]
data_path = repo_path / "data"
in_base_path = data_path / "in"
in_base_paths = sorted(in_base_path.glob("*[!_EXCLUDE].csv"))
out_base_path = repo_path / "data/out"
name_resolution_path = data_path / 'name-resolution.json'
with name_resolution_path.open() as file:
    name_resolution = json.load(file)
name_resolution_tmp_path = data_path / 'name-resolution-tmp.json'

lookup = {}
name_map = {}
index_names = {}
index_sectors = {UNSPECIFIED: 0}


def field_name(input):
    first, *rest = input.split(' ')
    output = f'{first.lower()}{"".join([r.capitalize() for r in rest])}'
    return output


def memo_names(name, field, value):
    name_map[name] = name_map.setdefault(name, {})
    current = name_map[name].setdefault(field, [])
    name_map[name][field] = list(set(current).union([value]))


def process_lookup():
    array = []
    id = 0
    name_id = 0
    sector_id = 1
    out_lookup_path = out_base_path / "lookup.json"
    out_names_path = out_base_path / "names_memo.json"
    out_array_path = out_base_path / "array.json"
    out_lookup_names = out_base_path / "lookup-names.json"
    out_lookup_sectors = out_base_path / "lookup-sectors.json"
    for in_base_path in in_base_paths:
        match = re.match(r".*?([1-2][0|9][0-9][0-9]).*", str(in_base_path))
        yearfrom = match.group(1)
        yearto = int(yearfrom) + 1
        year = f'{yearfrom}-{yearto}'
        print(f'\nProcessing "{str(in_base_path)}" as year {year}')
        with in_base_path.open() as file:
            reader = csv.DictReader(file)
            out_fields = list(
                (set(fields) & set(reader.fieldnames)).union(forced_fields))
            missing_fields = list(set(fields) - set(out_fields))
            print(f" - matched fields: {out_fields}")
            print(f" - missing fields: {missing_fields}")
            for mandatory_field in mandatory_fields:
                if mandatory_field in missing_fields:
                    print(
                        f"Mandatory field '{mandatory_field}' missing from {in_base_path}")
                    sys.exit(1)
            for row in reader:
                out_obj = {"year": year}
                for field in out_fields:
                    value = row.setdefault(
                        field, UNSPECIFIED).replace("\n", " ").strip()
                    if field == 'Name':
                        value = normalize_beneficiary_name(value)
                        value_resolve = resolve_name(value)
                        value = name_resolution.setdefault(
                            value_resolve, value)
                        if value not in index_names:
                            index_names[value] = name_id
                            name_id += 1
                        value = str(index_names[value])
                    elif field == "Sector":
                        value = sector_names[sectors[value]]
                        if value not in index_sectors:
                            index_sectors[value] = sector_id
                            sector_id += 1
                        value = str(index_sectors[value])
                    elif field == "Province":
                        value = province_names[provinces[value]]
                        memo_names(row["Name"].replace(
                            "\n", " "), "Province", value)
                    out_obj[field_name(field)] = value
                lookup[id] = out_obj
                array.append(out_obj)
                id += 1
    lookup_names = {value: key for key, value in index_names.items()}
    with name_resolution_tmp_path.open('w') as file:
        json.dump(name_resolution, file, indent=2)
    with out_lookup_names.open("w") as file:
        json.dump(lookup_names, file, indent=2)
    lookup_sectors = {value: key for key, value in index_sectors.items()}
    with out_lookup_sectors.open("w") as file:
        json.dump(lookup_sectors, file, indent=2)
    with out_lookup_path.open("w") as file:
        json.dump(lookup, file, indent=2, sort_keys=True)
    with out_array_path.open("w") as file:
        json.dump(array, file, indent=2)
    with out_names_path.open("w") as file:
        json.dump(name_map, file, indent=2)
    print(
        f"\n{len(lookup.keys())} rows processed - saved to {str(out_array_path)} and {str(out_array_path)}\n"
    )


def add_agg_layer(result, fields, index, row, i):
    if not isinstance(result, list):
        if index[i] not in result:
            result[index[i]] = {} if i < len(fields) - 2 else []
        add_agg_layer(result[index[i]], fields, index, row, i + 1)
    else:
        obj = {fields[i]: index[i], "amount": row.amount, "ids": row.ids}
        if "name" in obj and obj["name"] in name_map:
            obj["province"] = name_map[obj["name"]]["province"]
        result.append(obj)


def process_treemap(name, input):
    levels = name.split("_")
    tm = treemap(input, levels, 0)
    out_path = out_base_path / f"{name}-treemap.json"
    with out_path.open("w") as out_file:
        json.dump(tm, out_file, indent=2)
    print(f"Treemap {str(out_path)} saved")


def treemap(input, levels, i, key=None):
    tm = {"children": []}
    if i > 0:
        tm[levels[i - 1]] = key
    if isinstance(input, dict):
        for key, data in input.items():
            tm["children"].append(treemap(data, levels, i + 1, key))
    else:
        for record in input:
            tm["children"].append(record)
    return tm


def process_totals(data):
    df = pd.DataFrame.from_dict(data, orient="index")
    df["sector"] = df["sector"].fillna(0)
    df["amount"] = pd.to_numeric(df["amount"])
    df["ids"] = df.reset_index().index
    for fields in totals:
        grouped = df.groupby(fields).agg(
            {"amount": "sum", "ids": lambda x: x.tolist()})
        grouped = grouped.sort_values(by="amount", ascending=False)
        result = [] if len(fields) == 1 else {}
        for row in grouped.itertuples():
            index = [row.Index] if isinstance(
                row.Index, (str, int)) else row.Index
            add_agg_layer(result, fields, index, row, 0)
        base_name = "_".join(fields)
        out_path = out_base_path / f"{base_name}.json"
        with out_path.open("w") as out_file:
            json.dump(result, out_file, indent=2)
        print(f"Aggregation {str(out_path)} saved")
        process_treemap(base_name, result)
        if isinstance(result, list):
            for record in result:
                del record["ids"]
            out_path = out_base_path / f"{base_name}-no-ids.json"
            with out_path.open("w") as out_file:
                json.dump(result, out_file, indent=2)


process_lookup()
process_totals(lookup)
