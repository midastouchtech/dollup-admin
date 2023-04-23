import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import UserSearch from "../../../../components/Modal/userSearch";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../store/user";
import kebabCase from "just-kebab-case";
import ShortUniqueId from "short-unique-id";
import { assoc, assocPath } from "ramda";
import Uploader from "../../../../components/Upload";
import Img from "../../../../components/Img";
import ImgUploadWithCropper from "../../../../components/Img/crop";

function CategoryEditor({ socket }) {
  let params = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState({});
  const [originalCategory, setOriginalCategory] = useState({});
  const [hasUpdatedCategory, setHasUpdatedCategory] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (socket) {
      console.log("gettid cat");
      socket.emit("GET_CATEGORY", { id: params.categoryId });
      socket.on("RECEIVE_CATEGORY", (client) => {
        console.log("client page RECEIVE_category", client);
        setIsLoading(false);
        setCategory(client);
        setOriginalCategory(client);
      });
    }
  }, []);

  const setDetail = (key, value) => {
    let categoryWithId = { ...category };
    if (category.name) {
      categoryWithId = assoc("slug", kebabCase(category.name), categoryWithId);
    }
    setCategory(assocPath([key], value, categoryWithId));
  };

  const uid = new ShortUniqueId({ length: 10 });

  const saveCategory = () => {
    console.log("saving category", category);
    socket.emit("UPDATE_CATEGORY", category);
    socket.on("RECEIVE_UPDATE_CATEGORY_SUCCESS", (c) => {
      console.log("category created");
      navigate("/categories");
    });
  };

  useEffect(() => {
    let categoryWithId = { ...category };
    if (!category.id) {
      categoryWithId = assoc("id", uid(), categoryWithId);
      setCategory(categoryWithId);
    }
  }, [category, uid]);

  return (
    <div class="container">
      <div class="pagetitle"></div>
      <div class="row">
        <div className="col-xl-12 col-lg-12">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">Edit Category</h1>
              <button
                className={`btn  btn-outline-primary mr-1`}
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              <button className={`btn mr-1 btn-primary`} onClick={saveCategory}>
                Save Category
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
                    <label class="col-sm-12 col-form-label">
                      Category Name
                    </label>
                    <div class="col-sm-12">
                      <input
                        class="form-control input-default"
                        placeholder="enter name "
                        onChange={(e) => setDetail("name", e.target.value)}
                        value={category?.name}
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-12 col-form-label">Thumbnail</label>
                    <div className="col-sm-12">
                      <ImgUploadWithCropper
                        src={category?.thumbnail}
                        width="200"
                        height="200"
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
                        value={category?.id}
                        disabled
                      />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Slug</label>
                    <div class="col-sm-8">
                      <input
                        class="form-control input-default"
                        value={category?.slug}
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

export default CategoryEditor;
