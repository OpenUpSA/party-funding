import $ from 'jquery';

const CONTAINER_SELECTOR = '.filter-current';
const LABEL_SELECTOR = '.filter-current__label';
const ACTION_SELECTOR = '.filter-current__remove';

const $template = $(CONTAINER_SELECTOR);

export class Pill {
  constructor($parent, value, callback, lookup) {
    this._$parent = $parent;
    this._value = value;
    this._callback = callback;
    this._lookup = lookup;
    this.render();
  }

  render() {
    const $pill = $template.clone(true, true);
    $pill.find(LABEL_SELECTOR).text(this._lookup[this._value]);
    $pill.find(ACTION_SELECTOR).on('click', () => {
      $pill.remove();
      this._callback(this._value, false);
    });
    this._$parent.append($pill);
  }
}
