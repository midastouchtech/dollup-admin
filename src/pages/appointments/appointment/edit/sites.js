import { isEmpty } from "ramda";
import React, { useState } from "react";
import shortUUID from "short-uuid";

const Sites = ({ employeeSites, onChange }) => {
  const [site, setSite] = useState(null);

  const addSiteAndClear = (e) => {
    e.preventDefault();
    const sites = [...employeeSites, {id: shortUUID.generate(), name: site, hasAccessCard: false}];
    //console.log(sites);
    onChange(sites);
    setSite("");
  };

  const setSiteHassAccessCard = (id, hasAccessCard) => (e) => {
    console.log("value", e.target.value);
    console.log("changing access card for site", id, hasAccessCard);
    console.log("old sites", employeeSites);
    const sites = employeeSites.map((site) => {
      if (site.id === id) {
        return { ...site, hasAccessCard };
      }
      return site;
    });
    console.log("new sites", sites);
    onChange(sites);
  };

  const removeSite = (site) => {
    const sites = employeeSites.filter((s) => s.id !== site.id);
    onChange(sites);
  };

  return (
    <div>
      <div className="row">
        <div className="col-12">
          {isEmpty(employeeSites) && <p>No sites added</p>}
          {!isEmpty(employeeSites) && (
            <table className="table">
              <thead class="thead-dark">
                <tr>
                  <th>Site</th>
                  <th>Access Card</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeeSites.map((site) => (
                  <tr key={site.id} >
                    <td>{site.name}</td>
                    <td>
                      <div class="custom-control custom-checkbox checkbox-warning">
                        <input
                          type="checkbox"
                          class="custom-control-input"
                          checked={site.hasAccessCard}
                          value={site.id}                          
                          id={site.id}
                          onClick={setSiteHassAccessCard(site.id, !site.hasAccessCard)}
                        />
                        <label
                          class="custom-control-label"
                          for={site.id}
                        >
                          Access card?
                        </label>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => removeSite(site)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div class="input-group input-group-sm mb-3">
        <input
          type="text"
          class="form-control"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
        <div class="input-group-append">
          <button
            class="btn btn-outline-primary btn-xs"
            onClick={addSiteAndClear}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sites;
