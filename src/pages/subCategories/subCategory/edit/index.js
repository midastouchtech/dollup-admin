import moment from "moment";
import {
  any,
  assoc,
  has,
  isEmpty,
  isNil,
  values,
  assocPath,
  omit,
  reject,
  without,
  insert,
  equals,
} from "ramda";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Uploader from "../../../../components/Upload";
import { useSearchParams } from "react-router-dom";
import kebabCase from 'just-kebab-case';
import ShortUniqueId from "short-unique-id";
import Select from "react-select";
import ImgUploadWithCropper from "../../../../components/Img/crop";

function App({ socket }) {
  let params = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [subCategory, setCategory] = useState({});
  const [originalCategory, setOriginalCategory] = useState({});
  const [hasUpdatedCategory, setHasUpdatedCategory] = useState(false);
  const [searchParams] = useSearchParams();
  const [hasRequested, setHasRequested] = useState(false)
  const [categories, setCategories] = useState([]);

  useEffect(()=>{
    console.log("use effect socket", socket)
    if (socket && isLoading && hasRequested === false) {
      setHasRequested(true)
      socket.emit("GET_SUB_CATEGORY", { id: params.subCategoryId });
      socket.on("RECEIVE_SUB_CATEGORY", (client) => {
        console.log("client page RECEIVE_category", client);
        setIsLoading(false);
        setCategory(client);
        setOriginalCategory(client);
      })
    }
  
  }, [socket]);

  

  const setDetail = (key, value) => {
    let subCategoryWithId = { ...subCategory };
    if (subCategory.name) {
      subCategoryWithId = assoc("slug", kebabCase(subCategory.name), subCategoryWithId);
    }
    setCategory(assocPath([key], value, subCategoryWithId));
  };

  const saveCategory = () => {
    console.log("saving category");
    socket.emit("UPDATE_SUB_CATEGORY", subCategory);
    socket.on("RECEIVE_UPDATE_SUB_CATEGORY_SUCCESS", () => {
      console.log("subCategory updated");
      navigate("/sub-categories");
    });
  };
  const uid = new ShortUniqueId({ length: 10 });
  useEffect(() => {
    let subCategoryWithId = { ...subCategory };
    if (!subCategory?.id) {
      subCategoryWithId = assoc("id", uid(), subCategoryWithId);
      setCategory(subCategoryWithId);
    }
  }, [subCategory, uid]);

  useEffect(() => {
    if (socket && isEmpty(categories)) {
      socket.emit("GET_ALL_CATEGORIES", subCategory);
      socket.on("RECEIVE_ALL_CATEGORIES", (data) => {
        setCategories(data.categories);
      });
    }
  }, []);
  
  const handleChange = (selectedOption) => {
    const selectedCategory = categories.find(c => c.id === selectedOption.value)
    setCategory(assocPath(["category"], selectedCategory, subCategory));
  };

  const categoriesOptions = categories?.map(c => ({label: c.name, value: c.id}));

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
