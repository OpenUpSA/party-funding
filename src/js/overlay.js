import $ from 'jquery';
import { formatAmount } from './utils';

const COUNT_SELECTOR = '.beneficiary-info__grants-awarded';
const AMOUNT_SELECTOR = '.beneficiary-info__total-value';
const CONTAINER_SELECTOR = '.beneficiary-data';
const HEADER_SELECTOR = '.beneficiary-data__row.beneficiary-data__row--header';
const ROW_SELECTOR = '.beneficiary-data__row:not(.beneficiary-data__row--header)';
const ROW_AMOUNT_SELECTOR = '.beneficiary-data__row-allocation';
const ROW_PROJECT_SELECTOR = '.beneficiary-data__row-code';
const ROW_PROVINCE_SELECTOR = '.beneficiary-data__row-province';

const $count = $(COUNT_SELECTOR);
const $amount = $(AMOUNT_SELECTOR);

const $container = $(CONTAINER_SELECTOR);
const $rowTemplate = $(ROW_SELECTOR).clone(true, true);

export class Overlay {
  constructor($parent, data, lookups) {
    this._$parent = $parent;
    this._data = data;
    this._lookups = lookups;
  }

  update(name, ids) {
    this._$parent.find('.heading').text(name);
    const data = ids.map((id) => this._data[id]);
    const count = ids.length;
    const amount = data.reduce((total, current) => total + Number(current.amount), 0);
    $count.text(count);
    $amount.text(formatAmount(amount));
    $container.children().not(HEADER_SELECTOR).remove();
    data.forEach((d) => {
      const $row = $rowTemplate.clone(true, true);
      $row.find(ROW_AMOUNT_SELECTOR).text(formatAmount(d.amount));
      $row.find(ROW_PROJECT_SELECTOR).text(d.projectNumber || 'unknown');
      $row.find(ROW_PROVINCE_SELECTOR).text(this._lookups.province[d.province] || 'unknown');
      $container.append($row);
    });
  }
}
