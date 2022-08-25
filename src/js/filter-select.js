import { FilterSelectOption } from './filter-select-option';

export class FilterSelect {
  constructor($parent, name, filter, ascending, callback, lookup) {
    this._$parent = $parent;
    this._name = name;
    this._filter = filter;
    this._ascending = ascending;
    this._callback = callback;
    this._lookup = lookup;
    this._selected = [];
    this._unselected = Object.keys(filter);
    this.render();
  }

  render() {
    this._$parent.empty();
    const factor = this._ascending ? 1 : -1;
    this._selectedChildren = this._selected
      .map((value) => new FilterSelectOption(
        this._$parent,
        value,
        true,
        this.applyFilter.bind(this),
        this._lookup,
      ));
    this._unselectedChildren = this._unselected
      .sort((a, b) => {
        if (a > b) return factor;
        if (a < b) return factor * -1;
        return 0;
      })
      .map((value) => new FilterSelectOption(
        this._$parent,
        value,
        this._selected.length ? this._filter[value] : null,
        this.applyFilter.bind(this),
        this._lookup,
      ));
  }

  reset() {
    this._selected = [];
    this._unselected = Object.keys(this._filter);
    this.render();
  }

  search(keys) {
    this._unselected = keys.slice(0, 30);
    // subtract already selected ones?
    this.render();
  }

  applyFilter(value, include) {
    let includeAll = null;
    if (!this._selected.length && include) { // First filter select
      includeAll = false;
    } else if (this._selected.length === 1 && !include) { // Last filter deselect
      includeAll = true;
    }
    if (includeAll !== null) {
      Object.keys(this._filter).forEach((key) => {
        this._filter[key] = includeAll;
      });
    }
    if (!includeAll) {
      this._filter[value] = include;
    }
    this._selected = includeAll ? [] : Object.keys(this._filter).filter((key) => this._filter[key]);
    this._unselected = includeAll
      ? Object.keys(this._filter) : Object.keys(this._filter).filter((key) => !this._filter[key]);
    this.render(this._unselected);
    this._callback(this._name, this._filter);
  }
}
