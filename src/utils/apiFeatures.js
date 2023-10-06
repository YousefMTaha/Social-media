export class ApiFeatures {
  constructor(mongooseQuery, data) {
    this.mongooseQuery = mongooseQuery; // such as userModel.find();
    this.data = data; //such as req.data
  }

  pagination() {
    let { page, size } = this.data;

    // set default values for size and page
    if (!size || size <= 0) {
      size = 5; // the number of products will appear in one page
    }
    if (!page || page <= 0) {
      page = 1;
    }

    const skip = size * (page - 1); // amount of skip product in single page =>  page 1 skip 0    page 2 skip 5 (skip first 5 products that already appear in first page)

    // pass values to req to display it to user
    this.data.size = size;
    this.data.page = page;

    this.mongooseQuery.skip(skip).limit(size); // apply pagination concept on data retrieved from DB

    return this; // apply changes happened on mongooseQuery, data
  }

  filter() {
    const exclude = ["sort", "page", "size", "searchKey", "fields"];

    const dataFilter = JSON.parse(
      JSON.stringify(this.data).replace(RegExp(/gt|lt|gte|lte/g), (match) => {
        return "$" + match;
      })
    );
    exclude.forEach((element) => {
      delete dataFilter[element];
    });
    this.mongooseQuery
      .find(dataFilter)
      .clone()
      .countDocuments()
      .then((value) => {
        this.data.noDoc = value;
      });
    return this;
  }

  sort() {
    // sort data with specific field
    if (this.data.sort)
      this.mongooseQuery.sort(this.data.sort.replace(RegExp(/,/g), " "));
    return this;
  }

  select() {
    // select specific fields to appear
    if (this.data.fields)
      this.mongooseQuery.select(this.data.fields.replace(RegExp(/,/g), " "));
    return this;
  }

  search() {
    // search posts by content
    if (this.data.searchKey) {
      this.mongooseQuery.find({
        content: { $regex: `${this.data.searchKey}` },
      });
    }
    return this;
  }
}
