import $ from 'jquery';
import { FilterSelectOption } from './filter-select-option';
import { Pill } from './pill';

const PILL_CONTAINER_SELECTOR = '.filter-current-list';
const $pillContainer = $(PILL_CONTAINER_SELECTOR).empty().show();

export class FilterSearchSelect {
  constructor($parent, name, ascending, callback, lookup) {
    this._$parent = $parent;
    this._name = name;
    this._filter = null;
    this._ascending = ascending;
    this._callback = callback;
    this._lookup = lookup;
    this._selected = [];
    this.render();
  }

  render(selectedIndex) {
    // This unfortunate bit is to avoid the dropdown closing
    const selectedName = this._lookup[selectedIndex];
    this._$parent.children().each((i, child) => {
      if ($(child).find('span').text() === selectedName) {
        $(child).hide();
      } else {
        child.remove();
      }
    });

    const factor = this._ascending ? 1 : -1;
    $pillContainer.empty();
    this._selected
      .forEach((value) => {
        new Pill($pillContainer, value, this.applyFilter.bind(this), this._lookup);
      });
    this.unselectedChildren = this.unselected ? this.unselected
      .filter((value) => !(this._selected.includes(value)))
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
      )) : [];
  }

  reset() {
    this._selected = [];
    this._filter = null;
    this.render();
  }

  search(keys) {
    this.unselected = keys.slice(0, 30).filter((i) => !this._filter || !this._filter[i]);
    this.render();
  }

  applyFilter(value, include) {
    this._filter = this._filter || {};
    this._filter[value] = include;
    this._selected = Object.keys(this._filter).filter((key) => this._filter[key]);
    this._filter = this._selected.length ? this._selected
      .reduce((obj, val) => ({
        ...obj, [val]: true,
      }), {}) : null;
    this.render(value);
    this._callback(this._name, this._filter);
  }
}
