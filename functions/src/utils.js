/**
 * @param {import("firebase-functions/v1/https").Request} req
 * @param {string} urlString
 * @returns {URL}
 */
export function createURLWithRequestQueryParams(req, urlString) {
  const url = new URL(urlString);

  for (let key in req.query) {
    const queryStringValue = req.query[key];

    if (typeof queryStringValue !== "string")
      throw new Error("Bad query string");

    url.searchParams.append(key, queryStringValue);
  }

  return url;
}
