// TODO: This needs to be refactored
// It was built with only a treemap in mind, but now included list view
import $ from "jquery";
import { d3 } from "./d3";
import { formatAmount } from "./utils";

const SEARCH_LOADING_SELECTOR = ".search-loading";
const LOADING_SELECTOR = ".vis-loading";
const COUNT_SELECTOR = ".current-info__showing";
const AMOUNT_SELECTOR = ".current-info__total-value";
const DOWNLOAD_ACTION_SELECTOR = ".download-selected";

const DATA_LIST_LOADING_SELECTOR = ".data-list__loading";
const DATA_CONTAINER_SELECTOR = ".grant-data";
const DATA_HEADERS_SELECTOR = ".grant-data__row_inner.w-inline-block";

const TREEMAP_ID = "treemap1";

const $searchLoadingEl = $(SEARCH_LOADING_SELECTOR);
const $loadingEl = $(LOADING_SELECTOR);
const $count = $(COUNT_SELECTOR);
const $amount = $(AMOUNT_SELECTOR);

const $dataListLoadingEl = $(DATA_LIST_LOADING_SELECTOR);

// TODO: Maybe hide this already from Webflow side?
const DATA_ROW_EXAMPLE_SELECTOR =
  ".grant-data__row.is--open-modal.w-inline-block";
$(DATA_ROW_EXAMPLE_SELECTOR).remove();

const maxWidth = Math.min(
  window.innerWidth > 992
    ? window.innerWidth - 400 - 48 * 2
    : window.innerWidth - 16 * 2,
  992
);

const height = window.innerHeight / 8;

export class Treemaps {
  constructor($parent, data, lookups, filters, colors, overlay) {
    $parent.on("click", (evt) => {
      if (!(evt.target instanceof SVGRectElement)) {
        // Prevent webflow opening overlay
        evt.stopPropagation();
      }
    });
    $parent.append(
      `<div id="${TREEMAP_ID}" style="max-width: ${maxWidth}px; width: 100%"></div>`
    );
    this._data = data;
    this._filteredData = data;
    this._filteredFlatData = [];
    this._filteredFlatDataSortState = {};
    this._numberOfRowsToDisplay = null;
    this._flatDataSlice = [];
    this._lookups = lookups;
    this._filters = filters;
    this._initialFilters = {};
    Object.keys(this._filters).forEach((filter) => {
      this._initialFilters[filter] = {};
      Object.keys(this._filters[filter]).forEach((key) => {
        this._initialFilters[filter][key] = true;
      });
    });
    this._colors = colors;
    this._overlay = overlay;
    this._grantsCount = 0;
    this._grantsAmount = 0;
    this._tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "toolTip")
      .style("z-index", 99)
      .style("display", "none")
      .style("position", "absolute")
      .style("width", "auto")
      .style("height", "auto")
      .style("color", "#333")
      .style("background-color", "white")
      .style("box-shadow", "-8px 8px 10px 0px")
      .style("border-radius", "0.25rem")
      .style("padding", "0.5rem");
    $(DOWNLOAD_ACTION_SELECTOR).on("click", this.downloadFiltered.bind(this));
    this._totals = {
      year: {},
      province: {},
      sector: {},
    };
    $(DATA_HEADERS_SELECTOR).on("click", this.sortList.bind(this));
    this.update();
  }

  clearFilters() {
    this._filters = {};
    Object.keys(this._initialFilters).forEach((filter) => {
      this._filters[filter] = {};
      Object.keys(this._initialFilters[filter]).forEach((key) => {
        this._filters[filter][key] = true;
      });
    });
    this.update();
  }

  downloadFiltered() {
    const rows = [
      ["year", "sector", "name", "province", "projectNumber", "date", "amount"],
    ];
    this._filteredData.children.forEach((yearNode) => {
      yearNode.children.forEach((sectorNode) => {
        sectorNode.children.forEach((nameNode) => {
          nameNode.ids.forEach((id) => {
            const grant = this._lookups.grant[id];
            if (grant.year !== yearNode.year) {
              alert(
                `Data issue - treemap year ${yearNode.year} and data year ${grant.year} different!`
              );
            }
            if (grant.sector !== sectorNode.sector) {
              alert(
                `Data issue - treemap sector ${sectorNode.sector} and data sector ${grant.sector} different!`
              );
            }
            if (grant.name !== nameNode.name) {
              alert(
                `Data issue - treemap name ${nameNode.name} and data name ${grant.name} different!`
              );
            }
            rows.push([
              grant.year,
              `"${this._lookups.sector[grant.sector]}"`,
              `"${this._lookups.name[grant.name]}"`,
              grant.province,
              grant.projectNumber,
              grant.date,
              grant.amount,
            ]);
          });
        });
      });
    });
    const csvData = rows.map((row) => row.join(",")).join("\n");
    const csvBlob = new Blob([csvData], { type: "text/csv" });
    const filename = "data.csv";
    if (window.navigator.msSaveOrOpenBlob) {
      // IE
      window.navigator.msSaveBlob(csvBlob, filename);
    } else {
      // Other
      const ref = window.document.createElement("a");
      ref.href = window.URL.createObjectURL(csvBlob);
      ref.download = filename;
      document.body.appendChild(ref);
      ref.click();
      document.body.removeChild(ref);
    }
  }

  sortList(evt) {
    let headerEl;
    const nodeType = evt.target.nodeName;
    if (nodeType === "DIV") {
      headerEl = evt.target;
    } else if (nodeType === "A") {
      [headerEl] = evt.target.children;
    } else if (nodeType === "IMG") {
      [headerEl] = evt.target.parentElement.children;
    } else {
      throw Error(
        "Could not determine which field to filter on - maybe the HTML structure changed?"
      );
    }
    const field = headerEl.classList[0].split("-")[2];
    const sortLastDirection = this._filteredFlatDataSortState[field] || -1;
    const sortDirection = sortLastDirection * -1;
    this._filteredFlatDataSortState[field] = sortDirection;
    let lookupName = null;
    if (field === "beneficiary") {
      lookupName = "name";
    } else if (field === "category") {
      lookupName = "sector";
    }
    this._filteredFlatData.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      if (lookupName) {
        valueA = this._lookups[lookupName][valueA];
        valueB = this._lookups[lookupName][valueB];
      }
      if (valueA < valueB) return sortDirection;
      if (valueA > valueB) return sortDirection * -1;
      return 0;
    });
    const $headerContainerEl = $(headerEl.parentElement);
    const $arrow = $headerContainerEl.find(".sort-arrow");
    $headerContainerEl
      .parent()
      .children()
      .each(function () {
        $(this).find(".sort-arrow").first().removeClass("is--selected");
      });
    $arrow.addClass("is--selected");
    $arrow.css("transform", `rotate(${90 * (1 - sortDirection)}deg)`);
    this.updateListView(this._numberOfRowsToDisplay);
  }

  updateListView(numberOfRows) {
    $dataListLoadingEl.show();
    const lookups = this._lookups;
    this._numberOfRowsToDisplay = numberOfRows;
    this._flatDataSlice = this._filteredFlatData.slice(
      0,
      this._numberOfRowsToDisplay
    );
    $(DATA_CONTAINER_SELECTOR).empty();
    const dataRows = d3
      .select(DATA_CONTAINER_SELECTOR)
      .selectAll("a")
      .data(this._flatDataSlice);
    dataRows
      .enter()
      .append("a")
      .merge(dataRows)
      .attr("class", "grant-data__row is--open-modal w-inline-block")
      .each(function (d) {
        d3.select(this)
          .append("div")
          .attr("class", "grant-data__row-category")
          .text(lookups.sector[d.category]);
        d3.select(this)
          .append("div")
          .attr("class", "grant-data__row-beneficiary")
          .text(lookups.name[d.beneficiary]);
        d3.select(this)
          .append("div")
          .attr("class", "grant-data__row-amount")
          .text(d.amount);
        d3.select(this)
          .append("div")
          .attr("class", "grant-data__row-year")
          .text(d.year);
      });
    dataRows.exit().remove();
  }

  update(filter, values) {
    setTimeout(() => this._update(filter, values), 1);
  }

  _update(filter, values) {
    this._filteredFlatData = [];
    this._grantsCount = 0;
    this._grantsAmount = 0;
    if (filter) {
      this._filters[filter] = values;
    }
    this._clearTotals();
    this._filteredData = {
      children: this._data.children
        .filter((year) => this._filters.year[year.year] === true)
        .sort((a, b) => {
          if (a.year < b.year) return 1;
          if (a.year > b.year) return -1;
          return 0;
        })
        .map((year) => ({
          year: year.year,
          children: year.children
            .filter((sector) => this._filters.sector[sector.sector] === true)
            .map((sector) => ({
              sector: sector.sector,
              children: sector.children.filter((name) => {
                const beneficiary = name.name;
                const provinceAll = Object.keys(this._filters.province).reduce(
                  (all, curr) => all && this._filters.province[curr],
                  true
                );
                const grantIds = provinceAll
                  ? name.ids
                  : name.ids.filter(
                      (id) =>
                        this._filters.province[
                          this._lookups.grant[id].province
                        ] === true
                    );
                const include =
                  grantIds.length &&
                  (!this._filters.name ||
                    this._filters.name[beneficiary] === true);
                if (include) {
                  this._grantsCount += 1;
                  this._grantsAmount += name.amount;
                  this._totals.year[year.year] += name.amount;
                  this._totals.sector[sector.sector] += name.amount;
                  name.ids.forEach((id) => {
                    this._totals.province[this._lookups.grant[id].province] +=
                      this._lookups.grant[id].amount;
                  });
                  this._filteredFlatData.push({
                    beneficiary: name.name,
                    amount: name.amount,
                    year: year.year,
                    category: sector.sector,
                  });
                }
                return include;
              }),
            })),
        })),
    };
    this.sums = {};
    this._filteredData.children.forEach((year) => {
      this.sums[year.year] = year.children.reduce(
        (acc, sector) =>
          acc +
          sector.children.reduce((subacc, entity) => subacc + entity.amount, 0),
        0
      );
    });
    this._filteredData.children = this._filteredData.children.filter(
      (year) => this.sums[year.year] > 0
    );
    const max = Object.keys(this.sums).reduce(
      (acc, year) => Math.max(acc, this.sums[year]),
      0
    );

    this.updateListView(100);
    $(window).scroll(() => {
      if ($(document).height() - $(window).height() === $(window).scrollTop()) {
        //this.updateListView((this._numberOfRowsToDisplay += 100));
      }
    });

    const yearDivs = d3
      .select(`#${TREEMAP_ID}`)
      .selectAll("div")
      .data(this._filteredData.children);
    yearDivs
      .enter()
      .append("div")
      .merge(yearDivs)
      .attr("id", (d) => `year-${d.year}`)
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("margin-bottom", "1rem")
      .text((d) => d.year);
    yearDivs.exit().remove();

    this._filteredData.children.forEach((year) => {
      if (year.children.length) {
        const width = (this.sums[year.year] / max) * maxWidth || 1;
        const root = d3.hierarchy(year).sum((d) => d.amount);
        d3.treemap().size([width, height]).padding(2)(root);
        d3.select(`#year-${year.year}`)
          .append("svg")
          .attr("id", `year-${year.year}-svg`)
          .attr("width", width || 0)
          .attr("height", height || 0);
        const charts = d3
          .select(`#year-${year.year}-svg`)
          .selectAll("rect")
          .data(root.leaves());
        charts
          .enter()
          .append("rect")
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("width", (d) => d.x1 - d.x0)
          .attr("height", (d) => d.y1 - d.y0)
          .style("fill", (d) =>
            d.parent
              ? this._colors[this._lookups.sector[d.parent.data.sector]]
              : "red"
          )
          .on("mousemove", (evt, d) => {
            this._tooltip.style("left", `${evt.pageX + 10}px`);
            this._tooltip.style("top", `${evt.pageY}px`);
            this._tooltip.style("display", "inline-block");
            this._tooltip.html(
              `${this._lookups.name[d.data.name]}<br>${formatAmount(
                d.data.amount
              )}`
            );
          })
          .on("mouseout", () => {
            this._tooltip.style("display", "none");
          })
          .on("click", (evt, d) => {
            this._overlay.update(this._lookups.name[d.data.name], d.data.ids);
          });
        charts.exit().remove();
      }
    });
    this.setLoading(false);
  }

  setLoading(activate) {
    if (activate) {
      $searchLoadingEl.show();
      $dataListLoadingEl.show();
      $loadingEl.show();
      $count.text("Loading...");
      $amount.text("Calculating...");
    } else {
      $searchLoadingEl.hide();
      $dataListLoadingEl.hide();
      $loadingEl.hide();
      $count.text(this._grantsCount);
      $amount.text(formatAmount(this._grantsAmount));
    }
  }

  _clearTotals() {
    Object.keys(this._totals).forEach((dim) => {
      Object.keys(this._totals[dim]).forEach((key) => {
        this._totals[dim][key] = 0;
      });
    });
  }
}
