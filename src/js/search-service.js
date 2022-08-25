import SearchApi, { INDEX_MODES } from 'js-worker-search';

export class SearchService {
  constructor() {
    this._api = new SearchApi({
      indexMode: INDEX_MODES.PREFIXES,
    });
    return this;
  }

  /*
  * Index set of data for use in searchService.search()
  * @param {Object|Object[]} data - Data to index; map or array of records
  * @param {Object} config - Indexing configuration
  * @param {string[]} [config.fields] - Fields to include in index, if record is a map
  * @param {string} [config.keyField] - Field to return as search result key, if record is a map
  * @param {boolean} [config.inverted] - If data is already an inverted index
  * @example
  * // Searches on 'Hi Bye' will return '12'
  * searchService.index([{a: 'Hi', b: 'Bye', id: 12}], {fields: ['a', 'b'], keyField: 'id'})
  * @example
  * // Searches on 'Hi Bye' will return '12'
  * searchService.index({'12': {a: 'Hi', b: 'Bye'}}, {fields: ['a', 'b']})
  * @example
  * // Searches on 'Hi Bye' will return '12'
  * searchService.index({'12': {a: 'Hi', b: 'Bye', id: '34'}}, {fields: ['a', 'b'], keyField: 'id'})
  * @example
  * // Searches on 'Hi Bye' will return '12'
  * searchService.index({'12': 'Hi Bye'})
  * @example
  * // Searches on 'Hi Bye' will return '12'
  * searchService.index({'Hi Bye': 12}, {inverted: true})
  */
  index(data, config) {
    const _config = config || {};
    if (data instanceof Array) {
      if (!_config.keyField) {
        throw new Error('keyField must be specified when indexing an array');
      }
      data.forEach((member) => {
        const record = {
          ...member,
          _key: member[_config.keyField],
        };
        this.indexOne(record, '_key', _config.fields);
      });
    } else {
      Object.keys(data).forEach((key) => {
        let record;
        if (_config.inverted) {
          record = {
            _key: data[key],
            _value: key,
          };
          this.indexOne(record, '_key', ['_value']);
        } else if (data[key] instanceof Object) {
          record = {
            _key: _config.keyField ? data[key][_config.keyField] : key,
            ...data[key],
          };
          this.indexOne(record, '_key', _config.fields);
        } else {
          record = {
            _key: key,
            _value: data[key],
          };
          this.indexOne(record, '_key', ['_value']);
        }
      });
    }
    return this;
  }

  /*
  * Index single record for use in searchService.search()
  * @param {Object} record - Record to index as key-value map
  * @param {string} keyField - Field in record to return as search result key
  * @param {string[]} [fields] - Fields to include in index (all fields if not provided)
  * @example
  * // Searches on 'Hi Bye' will return '12'
  * searchService.indexOne({a: 'Hi', b: 'Bye', id: 12}, 'id')
  * @example
  * // Searches on 'Hi' (not 'Bye') will return '12'
  * searchService.indexOne({a: 'Hi', b: 'Bye', id: 12}, 'id', ['a'])
  */
  indexOne(record, keyField, fields) {
    const finalFields = fields || Object.keys(record);
    const text = finalFields.map((f) => record[f]).join(' ');
    this._api.indexDocument(record[keyField], text);
    return this;
  }

  search(input, callback) {
    const promise = this._api.search(input);
    promise.then((results) => {
      callback(results.slice(0, 30));
    });
  }
}
