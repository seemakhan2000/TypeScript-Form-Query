import { useMutation, useQueryClient } from "react-query";

import { addUser, deleteUser, updateUser } from "../services/userService";

export const useAddUserMutation = (onFormSubmit: () => void) => {
  return useMutation(addUser, {
    onSuccess: () => {
      onFormSubmit();
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
  });
};
