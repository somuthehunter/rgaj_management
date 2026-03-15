export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("token");
};
