import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Form from "./component/form/form";
import Table from "./component/table/table";
import Login from "./module/login/Login";
import Signup from "./module/signup/Signup";
import Logout from "./module/logout/logout";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/form"
            element={
              <>
                <div className="addButtonContainer">
                  <button
                    type="button"
                    className="btn btn-primary add-user-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    Add User
                  </button>
                </div>

                <div className="logout-btn-container">
                  <Logout />
                </div>

                <div
                  className="modal fade"
                  id="exampleModal"
                  tabIndex={-1}
                  aria-labelledby="exampleModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3 className="modal-title" id="exampleModalLabel">
                          User Form
                        </h3>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="containers">
                        <Form
                          onFormSubmit={() =>
                            queryClient.invalidateQueries("users")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  <Table />
                </div>
              </>
            }
          />
          <Route path="/" element={<Signup />} /> {/* Default route */}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
