import React, { useState } from "react";
import { useQuery } from "react-query";
import { fetchUsers } from "../../services/userService";
import { UserData } from "../type/type";
import {
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../mutation/mutation";
import "./table.css";

const Table: React.FC = () => {
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(3);

  const {
    data: { users, totalCount } = { users: [], totalCount: 0 },
    isLoading,
    isError,
    error,
  } = useQuery(["users", currentPage, limit], () =>
    fetchUsers(currentPage, limit)
  );

  const totalPages = Math.ceil(totalCount / limit);
  const deleteUserMutation = useDeleteUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const handleDelete = (id: string) => deleteUserMutation.mutate(id);
  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setShowModal(true);
  };
  const handleModalClose = () => setShowModal(false);
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) return <div className="loader"></div>;
  if (isError)
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Something went wrong"}
      </div>
    );

  return (
    <div>
      {showModal && editingUser && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title edit-user">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingUser) updateUserMutation.mutate(editingUser);
                    handleModalClose();
                  }}
                >
                  {/* Form fields */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* Phone */}
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={editingUser.phone}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary save-changes"
                  >
                    Save changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Table */}
      <table className="table" id="myTable">
        <thead className="table-dark">
          <tr className="th">
            <th scope="col">S.NO</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: UserData, index: number) => (
            <tr key={user._id}>
              <td>{(currentPage - 1) * limit + index + 1}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(user._id)}
                >
                  <i className="fas fa-trash" />
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleEditClick(user)}
                >
                  <i className="fas fa-pencil-alt" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination  */}
      <div className="pagination-buttons">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            disabled={currentPage === index + 1}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Table;
