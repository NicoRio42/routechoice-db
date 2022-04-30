/**
 * @typedef Rerun2dIframe
 * @property {Window & Rerun2dWindow} contentWindow
 */

/**
 * @typedef Rerun2dWindow
 * @property {import("../../models/mapviewer").Mapviewer} mapviewer
 */

/**
 *
 * @param {HTMLIFrameElement & Rerun2dIframe} iframe
 * @returns {import("../../models/mapviewer").Mapviewer}
 */
export function getMapviewer(iframe) {
  return iframe.contentWindow.mapviewer;
}
