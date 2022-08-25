import { SearchService } from './search-service';

export class Search {
  // TODO: bring this in line with redesigned search service
  constructor($parent, searchData, searchFields, keyField, callback) {
    const searchService = new SearchService().index(searchData);
    $parent.find('.search-input')
      .on('keyup', (evt) => {
        evt.stopPropagation();
        const { value } = evt.target;
        searchService.search(value, callback);
      });
  }
}
