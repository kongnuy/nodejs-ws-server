const axios = require("axios");

const baseLink = "https://anglaisenligne.cm/wsaction";
//const baseLink = "http://localhost:8008/wsaction";

async function getInstance() {
  return new Promise(async (resolve, reject) => {
    resolve(axios.create({ timeout: 60000 }));
  });
}

async function getUserBySession(sessionID) {
  const res = await get(`${baseLink}/getuserbysession?token=${sessionID}`);
  if (res && res.data && res.data.id) return res.data;
  return false;
}

async function updateConnection(resourceId, userID) {
  const res = await get(
    `${baseLink}/updateconnection?userID=${userID}&resourceId=${resourceId}`
  );
  if (res && res.data && res.data.id) return res.data;
  return false;
}

async function userData(userID) {
  const res = await get(`${baseLink}/userdata?userID=${userID}`);
  if (res && res.data && res.data.id) return res.data;
  return false;
}

async function get(path) {
  const axiosInstance = await getInstance();
  return axiosInstance
    .get(encodeURI(path))
    .then((res) => handleResponse(res))
    .catch((err) => handleError(err));
}

function handleResponse(res) {
  console.log("Request response data ==> ", res.data);
  return res.data;
}

function handleError(err) {
  console.log("<== Request Error ==> ");
  let data = null;
  let status = 500;
  let message =
    "Une érreur est survenu lors de l'opération. Merci de reéssayer !";
  if (err.response) {
    console.log(err.response.data);
    console.log(err.response.status);
    console.log(err.response.config);
    data = err.response.data;
    status = err.response.status;
    if (err?.response?.data?.message) {
      message = err.response.data.message;
    }
  } else if (err.request) {
    console.log(err.request);
  } else {
    console.log(err.message);
  }
  console.log("<== End request Error ==> ");
  console.log("==> status ", status);
  return { success: false, status, data, message };
}

module.exports = {
  get,
  getUserBySession,
  updateConnection,
  userData,
};
