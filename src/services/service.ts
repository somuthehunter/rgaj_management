import { base_url } from "./config";

// GET
export const getService = async (
  endPoint: string,
  // cacheOption?: RequestCache,
  header?: object | undefined
) => {
  try {
    const res = await fetch(base_url + endPoint, {
      method: "GET",
      headers: {
        ...header,
      },
      // cache: cacheOption || "force-cache",
    });
    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// POST
export const postService = async (
  endPoint: string,
  reqest: object,
  header: object
) => {
  try {
    const res = await fetch(base_url + endPoint, {
      method: "POST",
      body: JSON.stringify(reqest),
      headers: { ...header },
    });
    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// PUT
export const putService = async (
  endPoint: string,
  reqest: object,
  header: object
) => {
  try {
    const res = await fetch(base_url + endPoint, {
      method: "PUT",
      body: JSON.stringify(reqest),
      headers: { ...header },
    });

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// PATCH
export const patchService = async (
  endPoint: string,
  reqest: object,
  header: object
) => {
  try {
    const res = await fetch(base_url + endPoint, {
      method: "PATCH",
      body: JSON.stringify(reqest),
      headers: { ...header },
    });

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// DELETE
export const deleteService = async (endPoint: string, header: object) => {
  try {
    const res = await fetch(base_url + endPoint, {
      method: "DELETE",
      headers: { ...header },
    });

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
