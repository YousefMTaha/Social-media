export function pageInfo(data) {
  data.noOfPage = Math.ceil((data.noDoc || 1) / data.size); // calculate no of page

  if (data.page != data.noOfPage) data.nextPage = +data.page + 1; // calculate next page
  if (+data.page != 1) data.previousPage = data.page - 1; // calculate pervious page
}
