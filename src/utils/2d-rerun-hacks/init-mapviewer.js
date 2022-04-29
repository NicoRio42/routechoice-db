import { selectHack } from "./select-hack";

export async function initMapviewer(mapviewer, iframe) {
  mapviewer.loadseu("http://www.tulospalvelu.fi/gps/", "logatec_3LENA");

  const res = await fetch("course-tags.json");
  const data = await res.json();
  mapviewer.tags = data.tags;
  mapviewer.coursecoords = data.coursecoords;
  mapviewer.otechinfo = data.otechinfo;
  mapviewer.request_redraw();
  mapviewer.update_routediv();
  console.log(mapviewer);
  iframe.contentDocument.getElementById("shown").click();
  selectHack(iframe, "selectmode", "analyzecourse");
  selectHack(iframe, "showtagsselect", "1");

  return data;
}
