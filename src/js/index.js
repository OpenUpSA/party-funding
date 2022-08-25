import $ from "jquery";
import { d3 } from "./d3";
import { FilterSelect } from "./filter-select";
import { FilterSearchSelect } from "./filter-search-select";
import { Search } from "./search";
import { Treemaps } from "./treemaps";
import { Overlay } from "./overlay";
import { AnnualReports } from "./annual-reports";

const legend = $(".legend__wrapper");

$(".search-loading").show();

Promise.all([
  d3.json("data/lookup.json"),
  d3.json("data/year_Sector_Name-treemap.json"),
  d3.json("data/lookup-names.json"),
  d3.json("data/lookup-sectors.json"),
  d3.json("data/Province-no-ids.json"),
  d3.json("data/annual-report-filenames.json"),
])
  .then(
    ([
      lookup,
      data,
      nameLookup,
      sectorLookup,
      provinceSummary,
      annualReports,
    ]) => {
      new AnnualReports(annualReports);
      const lookups = {
        grant: lookup,
        name: nameLookup,
        sector: sectorLookup,
        province: {
          UNSPECIFIED: "UNSPECIFIED",
          N: "National",
          EC: "Eastern Cape",
          FS: "Free State",
          GP: "Gauteng",
          KZN: "Kwazulu-Natal",
          LP: "Limpopo",
          MP: "Mpumalanga",
          NC: "Northern Cape",
          NW: "North West",
          WC: "Western Cape",
        },
      };
      const colors = {
        "Arts, culture and national heritage": legend
          .find(".legend-swatch--colour-1")
          .css("background-color"),
        Charities: legend
          .find(".legend-swatch--colour-2")
          .css("background-color"),
        Miscellaneous: legend
          .find(".legend-swatch--colour-3")
          .css("background-color"),
        "Sports & recreation": legend
          .find(".legend-swatch--colour-4")
          .css("background-color"),
        UNSPECIFIED: legend
          .find(".legend-swatch--colour-5")
          .css("background-color"),
      };

      const years = data.children.reduce(
        (obj, val) => ({
          ...obj,
          [val.year]: true,
        }),
        {}
      );

      const provinces = provinceSummary.reduce(
        (obj, val) => ({
          ...obj,
          [val.province]: true,
        }),
        {}
      );

      const sectorFilter = Object.keys(sectorLookup).reduce(
        (obj, key) => ({
          ...obj,
          [key]: true,
        }),
        {}
      );

      const filters = {
        year: years,
        sector: sectorFilter,
        province: provinces,
      };

      const overlay = new Overlay($(".beneficiary-info"), lookup, lookups);

      const treemaps = new Treemaps(
        $(".data-vis:not(.vis-loading)"),
        data,
        lookups,
        filters,
        colors,
        overlay
      );

      const filter = (name, values) => {
        treemaps.update(name, values);
      };

      const $yearFilter = $("#wf-form-Year-list");
      const yearFilter = new FilterSelect(
        $yearFilter,
        "year",
        years,
        false,
        filter.bind(this)
      );

      const $sectorFilter = $("#wf-form-Grant-categories-list");
      const sectorFilterSelect = new FilterSelect(
        $sectorFilter,
        "sector",
        sectorFilter,
        true,
        filter.bind(this),
        lookups.sector
      );

      const $provinceFilter = $("#wf-form-Province-list");
      const provinceFilter = new FilterSelect(
        $provinceFilter,
        "province",
        provinces,
        true,
        filter.bind(this),
        lookups.province
      );

      const $beneficiaryFilter = $("#wf-form-Beneficiaries-list");
      const beneficiaryFilter = new FilterSearchSelect(
        $beneficiaryFilter,
        "name",
        true,
        filter.bind(this),
        lookups.name
      );
      const $beneficiarySearch = $("#wf-form-Beneficiaries-search");
      new Search(
        $beneficiarySearch,
        nameLookup,
        ["name"],
        "name",
        beneficiaryFilter.search.bind(beneficiaryFilter)
      );

      $(".clear-filters").on("click", () => {
        treemaps.clearFilters();
        yearFilter.reset();
        sectorFilterSelect.reset();
        provinceFilter.reset();
        beneficiaryFilter.reset();
      });
    }
  )
  .catch(function (e) {
    console.log(e);
    $(".data-list__loading").hide();
    $(".search-loading").hide();
  });
