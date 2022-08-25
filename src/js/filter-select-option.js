import $ from 'jquery';

const classChecked = 'w--redirected-checked';

const $template = $('.filter-checkbox--dropdown')
  .removeClass('hidden')
  .removeAttr('id')
  .prop('checked', true);

export class FilterSelectOption {
  constructor($container, value, selected, callback, lookup) {
    this.$container = $container;
    this._value = value;
    this._selected = selected;
    this._callback = callback;
    this._lookup = lookup;
    this.render();
  }

  render() {
    const $option = $template.clone(true, true)
      .change({ value: this._value }, this.onChange.bind(this));
    if (this._selected === true) {
      $option.find('.w-checkbox-input')
        .addClass(classChecked);
    } else {
      $option.find('.w-checkbox-input')
        .removeClass(classChecked);
    }
    $option.find('.checkbox-label')
      .text(this._lookup ? this._lookup[this._value] : this._value);
    this.$checkDiv = $option.find('.w-checkbox-input');
    this.$container.append($option);
  }

  onChange(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this._selected = !this._selected;
    if (this._selected) {
      this.$checkDiv.addClass(classChecked);
    } else {
      this.$checkDiv.removeClass(classChecked);
    }
    this._callback(this._value, this._selected);
  }
}
