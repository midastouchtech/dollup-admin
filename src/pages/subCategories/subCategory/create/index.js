import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useParams } from "react-router-dom";
import UserSearch from "../../../../components/Modal/userSearch";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../store/user";
import kebabCase from "just-kebab-case";
import ShortUniqueId from "short-unique-id";
import { assoc, assocPath, isEmpty } from "ramda";
import Dropdown from "react-bootstrap/Dropdown";
import Fuse from "fuse.js";
import ImgUploadWithCropper from "../../../../components/Img/crop";
import DropdownButton from "react-bootstrap/DropdownButton";
import Select from "react-select";

function App(props) {
  const { socket } = props;
  const currentUser = useSelector(selectUser).data;

  const [searchParams, setSearchParams] = useSearchParams();
  let query = {};
  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [subCategory, setCategory] = useState({
    createdBy: currentUser,
    creationDate: new Date(),
  });
  const [show, setShow] = useState(false);

  const setDetail = (key, value) => {
    let subCategoryWithId = { ...subCategory };
    if (subCategory.name) {
      subCategoryWithId = assoc(
        "slug",
        kebabCase(subCategory.name),
        subCategoryWithId
      );
    }
    setCategory(assocPath([key], value, subCategoryWithId));
  };

  const options = {
    includeScore: true,
    keys: ["name"],
  };
  const fuse = new Fuse(categories, options);
  const filterCategoriesBy = (term) => {
    const result = fuse.search(term);
    console.log(result);
  };
  const setTermAndSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterCategoriesBy(term);
  };
  const selectCategory = (category) =>
    setCategory(assocPath(["category"], category, subCategory));

  const saveCategory = () => {
    console.log("saving subCategory", subCategory);
    socket.emit("CREATE_NEW_SUB_CATEGORY", subCategory);
    socket.on("RECEIVE_CREATE_SUB_CATEGORY_SUCCESS", (c) => {
      console.log("subCategory updated");
      navigate("/sub-categories");
    });
  };

  useEffect(() => {
    const uid = new ShortUniqueId({ length: 10 });
    let subCategoryWithId = { ...subCategory };
    if (!subCategory.id) {
      subCategoryWithId = assoc("id", uid(), subCategoryWithId);
      setCategory(subCategoryWithId);
    }
  }, [subCategory]);

  useEffect(() => {
    let newCategory = { ...subCategory };
    if (query.name) {
      console.log("setting name");
      newCategory = {
        ...newCategory,
        name: query.name,
        slug: kebabCase(query.name),
      };
    }
    if (query.category) {
      const selectedCategory = categories.find((c) => c.id === query.category);
      newCategory = { ...newCategory, category: selectedCategory };
    }
    if (query.thumbnail) {
      newCategory = { ...newCategory, thumbnail: query.thumbnail };
    }
    setCategory(newCategory);
  }, [categories]);

  useEffect(() => {
    if (socket && isEmpty(categories)) {
      socket.emit("GET_ALL_CATEGORIES", subCategory);
      socket.on("RECEIVE_ALL_CATEGORIES", (data) => {
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      });
    }
  }, []);

  const handleChange = (selectedOption) => {
    const selectedCategory = categories.find(
      (c) => c.id === selectedOption.value
    );
    setCategory(assocPath(["category"], selectedCategory, subCategory));
  };

  const categoriesOptions = categories?.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  const selectedOption = [
    { label: subCategory?.category?.name, value: subCategory?.category?.id },
  ];
  console.log("so", selectedOption);
  console.log(subCategory);
  return (
    <div class="container">
      <div class="pagetitle"></div>
      <div class="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">Create a Sub Category</h1>
              <button
                className={`btn  btn-outline-primary mr-1`}
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              <button className={`btn mr-1 btn-primary`} onClick={saveCategory}>
                Save
              </button>
            </div>
          </div>
        </div>
        <div class="col-xl-12 col-lg-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Details</h4>
            </div>
            <div class="card-body">
              <div class="basic-form">
                <form>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Category</label>
                    <div class="col-sm-8">
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        value={selectedOption}
                        defaultValue={categoriesOptions[0]}
                        isDisabled={isEmpty(categories)}
                        isLoading={isEmpty(categories)}
                        isSearchable
                        name="categories"
                        options={categoriesOptions}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-12 col-form-label">
                      Sub Category Name
                    </label>
                    <div class="col-sm-12">
                      <input
                        class="form-control input-default"
                        placeholder="enter name "
                        onChange={(e) => setDetail("name", e.target.value)}
                        value={subCategory?.name}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-12 col-form-label">Thumbnail</label>
                    <div className="col-sm-12">
                      <ImgUploadWithCropper
                        src={subCategory?.thumbnail}
                        width="400"
                        height="400"
                        onUploadComplete={(src) => setDetail("thumbnail", src)}
                        onUploadError={(err) => console.log(err)}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">ID</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        value={subCategory?.id}
                        disabled
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Slug</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        value={subCategory?.slug}
                        disabled
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
