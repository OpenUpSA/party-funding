import csv
import json
import argparse
from pathlib import Path
from transform import resolve_name


class SetEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, set):
            return list(o)
        return json.JSONEncoder.default(self, o)


def save_json(path, content):
    with path.open('w') as file:
        json.dump(content, file, indent=2, cls=SetEncoder)


def compare(filepath_one, filepath_two):
    one_amounts, one_names = process(filepath_one)
    two_amounts, two_names = process(filepath_two)
    not_in_one = two_names - one_names
    not_in_two = one_names - two_names
    in_both = one_names.intersection(two_names)
    in_both_amounts_different = {}
    in_both_amounts_same = {}
    for name in in_both:
        one_amount = one_amounts[name]
        two_amount = two_amounts[name]
        if one_amount != two_amount:
            in_both_amounts_different[name] = {
                filepath_one: one_amount,
                filepath_two: two_amount
            }
        else:
            in_both_amounts_same[name] = {
                filepath_one: one_amount,
                filepath_two: two_amount
            }
    one_ref = Path(filepath_one).stem
    two_ref = Path(filepath_two).stem
    temp_dir = Path('temp')
    if temp_dir.exists() is False:
        temp_dir.mkdir()
    compare_dir = temp_dir / f'{one_ref}_{two_ref}'
    if compare_dir.exists() is False:
        compare_dir.mkdir()
    save_json(compare_dir / 'summary.json', {
        f'not_in_{one_ref}': len(not_in_one),
        f'not_in_{two_ref}': len(not_in_two),
        'in_both': len(in_both),
        'in_both_but_amounts_different': len(in_both_amounts_different),
        'in_both_but_amounts_same': len(in_both_amounts_same),
    })
    save_json(compare_dir / f'not_in_{one_ref}.json', not_in_one)
    save_json(compare_dir / f'not_in_{two_ref}.json', not_in_two)
    save_json(compare_dir / 'in_both.json', in_both)
    save_json(compare_dir / 'in_both_amounts_different.json', in_both_amounts_different)
    save_json(compare_dir / 'in_both_amounts_same.json', in_both_amounts_same)
    print(f'\nDetails saved in {compare_dir}\n')


def process(filename):
    amounts_map = {}
    with open(filename) as file:
        reader = csv.DictReader(file)
        for row in reader:
            name = ' '.join(row['Name'].split()).replace('-', ' ')
            name = resolve_name(name)
            amounts_map[name] = amounts_map.setdefault(name, 0) + float(row['Amount'])
    return amounts_map, set(amounts_map.keys())


parser = argparse.ArgumentParser()
parser.add_argument('file_one')
parser.add_argument('file_two')
args = parser.parse_args()
compare(args.file_one, args.file_two)
