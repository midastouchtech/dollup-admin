import React, { useState } from "react";
import SearchModal from ".";

const UserSearch = ({ name, onUserSelect, socket, show, close }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setNotFound(false);
    setResults([]);
    socket.emit("SEARCH_USER", { term: searchTerm });
    socket.on("RECEIVE_SEARCHED_USER", (data) => {
      setResults(data);
      setLoading(false);
    });
    socket.on("RECEIVE_SEARCHED_USER_NOT_FOUND", (data) => {
      setResults([]);
      setNotFound(true);
      setLoading(false);
    });
  };

  const clearAndClose = () => {
    setSearchTerm("");
    setResults([]);
    close();
  };

  return (
    <SearchModal
      name={name}
      title="User Search"
      show={show}
      handleClose={clearAndClose}
    >
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for a user"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="input-group-append">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      <div className="list-group">
        {loading && (
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {notFound && (
          <div className="alert alert-danger" role="alert">
            No results found!
          </div>
        )}
        {results.map((result) => (
          <div
            className="list-group-item list-group-item-action"
            onClick={() => {
              onUserSelect(result)
              clearAndClose()
            }}
          >
            <div className="row">
              <div className="col-10">
                <span>{result?.details?.name}</span>
              </div>
              <div className="=col-2">
                <button className="btn btn-primary">Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SearchModal>
  );
};

export default UserSearch;
