import $ from 'jquery';

const CONTAINER_SELECTOR = '.report-years__wrapper';

const $container = $(CONTAINER_SELECTOR);
const $itemTemplate = $container.find('a').first().clone(true, true);
$itemTemplate.attr('download', '');
$container.empty();

export class AnnualReports {
  constructor(data) {
    this._data = data;
    this.render();
  }

  render() {
    this._data.forEach((item) => {
      const $item = $itemTemplate.clone(true, true);
      $item.attr('href', `data/annual-reports/${item.filename}`);
      $item.find('p').first().text(item.year);
      $container.append($item)
    })
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
